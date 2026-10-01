import { zeroAddress, type Address } from "viem";

/*
 * Pons V2 on Robinhood Chain (chain id 4663). Addresses read from the live
 * chain and from the verified Sourcify deployments; every owner-mutable term
 * (fee, limits, pair approvals, forwarder) is re-read before each launch.
 */

/** PonsV2LaunchFactory. */
export const PONS_FACTORY: Address = "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e";
/**
 * PonsV2LaunchAndBuy, the factory's launch forwarder: launch and first buy in
 * one transaction. Used only if the live launchForwarder() still matches.
 */
export const PONS_LAUNCH_AND_BUY: Address = "0xe33E9E479dF8802cb0866d5d05258bEc4cF62948";
/** Launch config used by the Pons launchpad. */
export const LAUNCH_CONFIG_ID = 0n;

/** Pair token addresses on Robinhood Chain. ETH is the native pair. Approval is checked live. */
export const PAIR_ADDRESSES: Record<string, Address> = {
  ETH: zeroAddress,
  USDG: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
  NVDA: "0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC",
  META: "0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35",
  AAPL: "0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9",
  TSLA: "0x322F0929c4625eD5bAd873c95208D54E1c003b2d",
  MSFT: "0xe93237C50D904957Cf27E7B1133b510C669c2e74",
  GOOGL: "0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3",
  COIN: "0x6330D8C3178a418788dF01a47479c0ce7CCF450b",
  PLTR: "0x894E1EC2D74FFE5AEF8Dc8A9e84686acCB964F2A",
  AMD: "0x86923f96303D656E4aa86D9d42D1e57ad2023fdC",
  MSTR: "0xec262a75e413fAfD0dF80480274532C79D42da09",
  SPCX: "0x4a0E65A3EcceC6dBe60AE065F2e7bb85Fae35eEa",
  SPY: "0x117cc2133c37B721F49dE2A7a74833232B3B4C0C",
  QQQ: "0xD5f3879160bc7c32ebb4dC785F8a4F505888de68",
};

/** On-chain metadata limits, in bytes (the deployer reverts past these). */
export const LIMITS = { name: 64, symbol: 16, logo: 512, description: 2048, social: 256 } as const;

export const byteLength = (s: string) => new TextEncoder().encode(s).length;
