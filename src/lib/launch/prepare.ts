"use client";

import {
  BaseError,
  ContractFunctionRevertedError,
  bytesToHex,
  decodeErrorResult,
  encodeFunctionData,
  getAddress,
  parseEventLogs,
  zeroAddress,
  type Address,
  type Hex,
  type PublicClient,
  type TransactionReceipt,
} from "viem";
import { ponsV2LaunchAndBuyAbi } from "@/abi/ponsV2LaunchAndBuy";
import { ponsV2LaunchDeployerErrorsAbi } from "@/abi/ponsV2LaunchDeployerErrors";
import { ponsV2LaunchFactoryAbi } from "@/abi/ponsV2LaunchFactory";
import { ponsV2LauncherTokenAbi } from "@/abi/ponsV2LauncherToken";
import { LAUNCH_CONFIG_ID, LIMITS, PONS_FACTORY, PONS_LAUNCH_AND_BUY, byteLength } from "@/lib/launch/config";

/*
 * Everything before the wallet prompt, read-only: live Pons terms, a fresh
 * economics digest, the exact calldata, an eth_call simulation and a gas
 * estimate. Nothing here signs or sends; the visitor's wallet does that.
 */

const launchAbi = [...ponsV2LaunchFactoryAbi, ...ponsV2LaunchDeployerErrorsAbi] as const;
const decodeAbi = [...launchAbi, ...ponsV2LaunchAndBuyAbi.filter((i) => i.type === "error")] as const;

export type LaunchInput = {
  account: Address;
  name: string;
  symbol: string;
  logo: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  pairToken: Address;
  creatorTaxBps: number;
  /** First buy in wei, native ETH pairs only. 0 = plain launch. */
  firstBuyWei: bigint;
};

export type Check = { label: string; ok: boolean; detail: string };

export type LaunchPlan = {
  ready: boolean;
  checks: Check[];
  /** Contract the wallet will call, and how. */
  to: Address;
  functionName: "launchToken" | "launchAndBuy";
  data: Hex;
  value: bigint;
  launchFee: bigint;
  firstBuyWei: bigint;
  minTokensOut: bigint;
  expectedTokensOut: bigint;
  gas: bigint;
  maxFeePerGas: bigint;
  /** Gas limit with 20% headroom times max fee per gas. */
  networkFee: bigint;
  balance: bigint;
  predictedToken: Address | null;
  maxCreatorTaxBps: number;
  snipeTaxStartBps: number;
  snipeTaxSeconds: number;
  economics: Hex;
  preparedAt: number;
  error: string | null;
};

/** Plans older than this are re-prepared before the wallet prompt (the economics digest is pinned). */
export const PLAN_MAX_AGE_MS = 30_000;

function randomSalt(): Hex {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

const read = <T>(client: PublicClient, functionName: string, args: readonly unknown[] = []) =>
  client.readContract({ address: PONS_FACTORY, abi: ponsV2LaunchFactoryAbi, functionName, args } as never) as Promise<T>;

const MESSAGES: Record<string, string> = {
  NotWhitelisted: "Pons is not accepting launches from this wallet right now.",
  InvalidTokenParams: "Name and ticker are both required.",
  CreatorTaxTooHigh: "The creator fee is above the Pons limit.",
  PairTokenNotApproved: "This pair is not approved on Pons.",
  MetadataTooLong: "A text field is too long for Pons: name 64, ticker 16, lore 2048 bytes.",
  LaunchFeeNotPaid: "The launch fee did not match what Pons expects. Prepare the launch again.",
  NativeValueMismatch: "The ETH sent did not match the fee plus first buy. Prepare the launch again.",
  LaunchEconomicsMismatch: "Pons changed its launch terms a moment ago. Prepare the launch again.",
  LaunchConfigDisabled: "This Pons launch configuration is switched off.",
  FailedDeployment: "That launch address is taken. Prepare again to pick a fresh one.",
  InsufficientBalance: "Not enough ETH for the launch.",
};

/** Turns a viem error into one calm sentence, naming the Pons error when there is one. */
export function describeError(error: unknown): string {
  const code = (error as { code?: number })?.code ?? (error instanceof BaseError ? (error.walk((e) => typeof (e as { code?: unknown }).code === "number") as { code?: number } | null)?.code : undefined);
  if (code === 4001) return "You declined in the wallet. Nothing was sent.";
  if (error instanceof BaseError) {
    const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError);
    let name: string | null = null;
    if (reverted instanceof ContractFunctionRevertedError) {
      name = reverted.data?.errorName ?? null;
      if (!name && reverted.raw && reverted.raw !== "0x") {
        try {
          name = decodeErrorResult({ abi: decodeAbi, data: reverted.raw }).errorName;
        } catch {
          name = null;
        }
      }
    } else {
      const withData = error.walk((e) => typeof (e as { data?: unknown }).data === "string") as { data?: Hex } | null;
      if (withData?.data && withData.data !== "0x") {
        try {
          name = decodeErrorResult({ abi: decodeAbi, data: withData.data }).errorName;
        } catch {
          name = null;
        }
      }
    }
    if (name) return MESSAGES[name] ?? `Pons rejected the launch (${name}).`;
    if (/insufficient funds/i.test(error.message)) return "Not enough ETH on Robinhood Chain for the launch and network fee.";
    return error.shortMessage;
  }
  const message = error instanceof Error ? error.message : String(error);
  if (/insufficient funds/i.test(message)) return "Not enough ETH on Robinhood Chain for the launch and network fee.";
  if (/user (rejected|denied)|declined/i.test(message)) return "You declined in the wallet. Nothing was sent.";
  return message;
}

export async function prepareLaunch(client: PublicClient, input: LaunchInput): Promise<LaunchPlan> {
  const checks: Check[] = [];
  const add = (label: string, ok: boolean, detail: string) => checks.push({ label, ok, detail });

  const [launchFee, canLaunch, maxCreatorTaxBps, snipeTaxStartBps, snipeTaxSeconds, forwarder, config, pairApproved, balance] = await Promise.all([
    read<bigint>(client, "launchFee"),
    read<boolean>(client, "canLaunch", [input.account]),
    read<bigint>(client, "maxCreatorTaxBps"),
    read<bigint>(client, "snipeTaxStartBps"),
    read<bigint>(client, "snipeTaxSeconds"),
    read<Address>(client, "launchForwarder"),
    read<{ enabled: boolean }>(client, "getLaunchConfig", [LAUNCH_CONFIG_ID]).catch(() => null),
    input.pairToken === zeroAddress ? Promise.resolve(true) : read<boolean>(client, "approvedPairTokens", [input.pairToken]),
    client.getBalance({ address: input.account }),
  ]);

  add("Launches open", canLaunch, canLaunch ? "Pons accepts launches from this wallet" : "Pons is not accepting launches from this wallet");
  add("Launch config", Boolean(config?.enabled), config?.enabled ? `Config ${LAUNCH_CONFIG_ID} is active` : `Config ${LAUNCH_CONFIG_ID} is not active`);
  add("Pair", pairApproved, pairApproved ? (input.pairToken === zeroAddress ? "ETH (native)" : "Approved on Pons") : "Not approved on Pons");
  const taxOk = BigInt(input.creatorTaxBps) <= maxCreatorTaxBps;
  add("Creator fee", taxOk, `${input.creatorTaxBps / 100}% (Pons limit ${Number(maxCreatorTaxBps) / 100}%)`);

  const lengths: [string, string, number][] = [
    ["Name", input.name, LIMITS.name],
    ["Ticker", input.symbol, LIMITS.symbol],
    ["Picture link", input.logo, LIMITS.logo],
    ["Lore", input.description, LIMITS.description],
    ["Website", input.website, LIMITS.social],
    ["X link", input.twitter, LIMITS.social],
    ["Telegram link", input.telegram, LIMITS.social],
  ];
  const over = lengths.filter(([, v, max]) => byteLength(v) > max).map(([k, v, max]) => `${k} ${byteLength(v)}/${max} bytes`);
  const textOk = over.length === 0 && input.name.length > 0 && input.symbol.length > 0;
  add("Text fields", textOk, textOk ? "Within the on-chain limits" : over.join(", ") || "Name and ticker are required");

  const useForwarder = input.firstBuyWei > 0n;
  if (useForwarder) {
    const same = forwarder.toLowerCase() === PONS_LAUNCH_AND_BUY.toLowerCase();
    add("First buy route", same, same ? "Launch and first buy in one transaction" : "The Pons forwarder changed; launch without a first buy");
  }

  const base: Omit<LaunchPlan, "ready" | "data" | "to" | "functionName" | "value" | "gas" | "maxFeePerGas" | "networkFee" | "predictedToken" | "expectedTokensOut" | "minTokensOut" | "economics" | "error"> = {
    checks,
    launchFee,
    firstBuyWei: input.firstBuyWei,
    balance,
    maxCreatorTaxBps: Number(maxCreatorTaxBps),
    snipeTaxStartBps: Number(snipeTaxStartBps),
    snipeTaxSeconds: Number(snipeTaxSeconds),
    preparedAt: Date.now(),
  };
  const empty = {
    to: PONS_FACTORY,
    functionName: "launchToken" as const,
    data: "0x" as Hex,
    value: launchFee + input.firstBuyWei,
    gas: 0n,
    maxFeePerGas: 0n,
    networkFee: 0n,
    predictedToken: null,
    expectedTokensOut: 0n,
    minTokensOut: 0n,
    economics: "0x" as Hex,
  };
  if (!checks.every((c) => c.ok)) return { ...base, ...empty, ready: false, error: checks.find((c) => !c.ok)!.detail };

  // Pin the current terms: fetched now, sent within PLAN_MAX_AGE_MS.
  const economics = await read<Hex>(client, "previewLaunchEconomics", [LAUNCH_CONFIG_ID, input.pairToken]);
  const params = {
    name: input.name,
    symbol: input.symbol,
    logo: input.logo,
    description: input.description,
    socials: { twitter: input.twitter, telegram: input.telegram, discord: "", website: input.website, farcaster: "" },
    creatorFeeRecipient: getAddress(input.account),
    creatorTaxBps: input.creatorTaxBps,
    buybackEnabled: false,
    expectedEconomics: economics,
    salt: randomSalt(),
  };

  try {
    let to: Address;
    let functionName: "launchToken" | "launchAndBuy";
    let data: Hex;
    let value: bigint;
    let predicted: Address;
    let expectedTokensOut = 0n;
    let minTokensOut = 0n;
    if (useForwarder) {
      to = PONS_LAUNCH_AND_BUY;
      functionName = "launchAndBuy";
      value = launchFee + input.firstBuyWei;
      const sim = await client.simulateContract({
        account: input.account,
        address: to,
        abi: ponsV2LaunchAndBuyAbi,
        functionName: "launchAndBuy",
        args: [params, LAUNCH_CONFIG_ID, input.pairToken, input.firstBuyWei, 0n, input.account, []],
        value,
      });
      const [token, , tokensOut] = sim.result as readonly [Address, Address, bigint];
      predicted = token;
      expectedTokensOut = tokensOut;
      minTokensOut = (tokensOut * 95n) / 100n; // 5% slippage floor
      data = encodeFunctionData({
        abi: ponsV2LaunchAndBuyAbi,
        functionName: "launchAndBuy",
        args: [params, LAUNCH_CONFIG_ID, input.pairToken, input.firstBuyWei, minTokensOut, input.account, []],
      });
    } else {
      to = PONS_FACTORY;
      functionName = "launchToken";
      value = launchFee;
      const sim = await client.simulateContract({
        account: input.account,
        address: to,
        abi: launchAbi,
        functionName: "launchToken",
        args: [params, LAUNCH_CONFIG_ID, input.pairToken],
        value,
      });
      predicted = (sim.result as readonly [Address, Address])[0];
      data = encodeFunctionData({ abi: launchAbi, functionName: "launchToken", args: [params, LAUNCH_CONFIG_ID, input.pairToken] });
    }
    add("Simulation", true, "The launch succeeds in a dry run against the live chain");

    const gas = await client.estimateGas({ account: input.account, to, data, value });
    const fees = await client.estimateFeesPerGas().catch(async () => ({ maxFeePerGas: await client.getGasPrice() }));
    const maxFeePerGas = fees.maxFeePerGas ?? (await client.getGasPrice());
    const networkFee = ((gas * 12n) / 10n) * maxFeePerGas;
    const enough = balance >= value + networkFee;
    add("Balance", enough, enough ? "Enough ETH for the launch and network fee" : "Not enough ETH for the launch and network fee");

    return {
      ...base,
      ready: enough,
      to,
      functionName,
      data,
      value,
      gas,
      maxFeePerGas,
      networkFee,
      predictedToken: predicted,
      expectedTokensOut,
      minTokensOut,
      economics,
      error: enough ? null : "Not enough ETH on Robinhood Chain for the launch and network fee.",
    };
  } catch (error) {
    const message = describeError(error);
    add("Simulation", false, message);
    return { ...base, ...empty, economics, ready: false, error: message };
  }
}

export type Launched = { token: Address; curve: Address; deployer: Address; pairToken: Address };

/** The new token comes from the factory's TokenLaunched event, not from return values. */
export function parseLaunched(receipt: TransactionReceipt): Launched | null {
  const ev = parseEventLogs({ abi: ponsV2LaunchFactoryAbi, eventName: "TokenLaunched", logs: receipt.logs }).find(
    (l) => l.address.toLowerCase() === PONS_FACTORY.toLowerCase(),
  );
  if (!ev) return null;
  const { token, curve, deployer, pairToken } = ev.args as { token: Address; curve: Address; deployer: Address; pairToken: Address };
  return { token, curve, deployer, pairToken };
}

export type OnChainSocials = { twitter: string; telegram: string; discord: string; website: string; farcaster: string };

/** Reads a launched token back from the chain: name, symbol, supply and its socials. */
export async function readLaunchedToken(client: PublicClient, token: Address) {
  const r = <T>(functionName: string) => client.readContract({ address: token, abi: ponsV2LauncherTokenAbi, functionName } as never) as Promise<T>;
  const [name, symbol, totalSupply, info] = await Promise.all([
    r<string>("name"),
    r<string>("symbol"),
    r<bigint>("totalSupply"),
    r<readonly [Address, string, string, OnChainSocials]>("getTokenInfo").catch(() => null),
  ]);
  const socials: OnChainSocials = info?.[3] ?? { twitter: "", telegram: "", discord: "", website: "", farcaster: "" };
  return { name, symbol, totalSupply, deployer: info?.[0] ?? null, logo: info?.[1] ?? "", socials, website: socials.website };
}

/**
 * Proof that a token recorded in this browser was launched by that recorded
 * transaction: the receipt succeeded and carries the factory's TokenLaunched
 * event for this exact token, deployed by the transaction's sender.
 */
export async function launchedByTx(client: PublicClient, token: Address, hash: `0x${string}`): Promise<boolean | null> {
  try {
    const receipt = await client.getTransactionReceipt({ hash });
    if (receipt.status !== "success") return false;
    const ev = parseLaunched(receipt);
    return Boolean(ev && ev.token.toLowerCase() === token.toLowerCase() && ev.deployer.toLowerCase() === receipt.from.toLowerCase());
  } catch {
    return null; // receipt not readable from this RPC
  }
}
