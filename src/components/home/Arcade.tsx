"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@/components/icons";
import { FAMILY, INK, KINDS, type Kind } from "@/lib/characters";

/* Game night: a tiny shooter where the family are the invaders and Pip
   defends the page. Everything is drawn on a 320 x 200 canvas from the 8 x 8
   sprites below, scaled up with crisp pixels. */

const SPRITES: Record<Kind, string[]> = {
  dot: ["..xxxx..", ".xxxxxx.", "xxxxxxxx", "xxoxxoxx", "xxoxxoxx", "xxxxxxxx", ".xxxxxx.", "..xxxx.."],
  block: ["xxxxxxxx", "xxxxxxxx", "xooxxoox", "xxoxxoxx", "xxxxxxxx", "xxxxxxxx", "xxxxxxxx", "xxxxxxxx"],
  spark: ["...xx...", "...xx...", "xxxxxxxx", ".xoxxox.", "..xxxx..", ".xxxxxx.", ".xx..xx.", "xx....xx"],
  ghost: ["..xxxx..", ".xxxxxx.", "xxoxxoxx", "xxoxxoxx", "xxxxxxxx", "xxxxxxxx", "xxxxxxxx", "x.xx.x.x"],
  bean: ["..xxx...", ".xxxxx..", ".xxxxxx.", "xxxxxxxx", "xxoxxxxx", "xxoxooxx", "xxxxxxxx", ".xxxxxx."],
  bloom: [".xx..xx.", "xxxxxxxx", "xwwxxwwx", "xwoxxwox", "xxxxxxxx", ".xxxxxx.", "xxxxxxxx", ".xx..xx."],
};

const W = 320;
const H = 200;
const PX = 2; // canvas pixels per sprite pixel

function drawSprite(ctx: CanvasRenderingContext2D, kind: Kind, x: number, y: number, alpha = 1) {
  const rows = SPRITES[kind];
  ctx.globalAlpha = alpha;
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const ch = rows[r][c];
      if (ch === ".") continue;
      ctx.fillStyle = ch === "o" ? INK : ch === "w" ? "#ffffff" : FAMILY[kind].color;
      ctx.fillRect(Math.round(x + c * PX), Math.round(y + r * PX), PX, PX);
    }
  }
  ctx.globalAlpha = 1;
}

/** Same sprites as static SVG, for the decorations around the game. */
export function PixelSprite({ kind, size = 32, className = "" }: { kind: Kind; size?: number; className?: string }) {
  const rects: React.ReactNode[] = [];
  SPRITES[kind].forEach((row, r) =>
    row.split("").forEach((ch, c) => {
      if (ch === ".") return;
      const fill = ch === "o" ? INK : ch === "w" ? "#fff" : FAMILY[kind].color;
      rects.push(<rect key={`${r}-${c}`} x={c} y={r} width="1.02" height="1.02" fill={fill} />);
    }),
  );
  return (
    <svg viewBox="0 0 8 8" width={size} height={size} className={className} shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  );
}

type Invader = { kind: Kind; x: number; y: number; alive: boolean };
type Shot = { x: number; y: number; dy: number };
type Game = {
  invaders: Invader[];
  shots: Shot[];
  bombs: Shot[];
  px: number;
  dir: number;
  speed: number;
  score: number;
  lives: number;
  cooldown: number;
  hurt: number;
  over: "won" | "lost" | null;
};

function newGame(): Game {
  const invaders: Invader[] = [];
  for (let row = 0; row < 3; row += 1) {
    KINDS.forEach((kind, col) => invaders.push({ kind, x: 46 + col * 38, y: 22 + row * 24, alive: true }));
  }
  return { invaders, shots: [], bombs: [], px: W / 2 - 8, dir: 1, speed: 9, score: 0, lives: 3, cooldown: 0, hurt: 0, over: null };
}

type Phase = "idle" | "playing" | "paused" | "won" | "lost";

export function Arcade() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game>(newGame());
  const keys = useRef<Record<string, boolean>>({});
  const touchX = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const [score, setScore] = useState(0);

  const setP = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const draw = useCallback(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const g = game.current;
    ctx.clearRect(0, 0, W, H);
    for (const inv of g.invaders) if (inv.alive) drawSprite(ctx, inv.kind, inv.x, inv.y, phaseRef.current === "idle" ? 0.45 : 1);
    ctx.fillStyle = "#fdd86e";
    for (const s of g.shots) ctx.fillRect(s.x, s.y, 2, 5);
    ctx.fillStyle = "#f4afc8";
    for (const b of g.bombs) ctx.fillRect(b.x, b.y, 2, 4);
    if (g.hurt % 6 < 3) drawSprite(ctx, "dot", g.px, H - 22, phaseRef.current === "idle" ? 0.5 : 1);
    if (phaseRef.current !== "idle") {
      ctx.fillStyle = "#cfc8ff";
      ctx.font = "8px monospace";
      ctx.fillText(`SCORE ${g.score}`, 6, 10);
      ctx.fillText(`LIVES ${"●".repeat(Math.max(0, g.lives))}`, W - 70, 10);
    }
  }, []);

  useEffect(() => {
    draw();
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (phaseRef.current === "playing") {
        const g = game.current;
        // Defender
        const move = (keys.current.ArrowLeft || keys.current.a ? -1 : 0) + (keys.current.ArrowRight || keys.current.d ? 1 : 0);
        if (touchX.current !== null) g.px += Math.max(-3, Math.min(3, touchX.current - (g.px + 8)));
        g.px = Math.max(2, Math.min(W - 18, g.px + move * 130 * dt));
        g.cooldown -= dt;
        if ((keys.current[" "] || touchX.current !== null) && g.cooldown <= 0) {
          g.shots.push({ x: g.px + 7, y: H - 24, dy: -190 });
          g.cooldown = 0.32;
        }
        // Invaders march
        const alive = g.invaders.filter((i) => i.alive);
        const minX = Math.min(...alive.map((i) => i.x));
        const maxX = Math.max(...alive.map((i) => i.x + 16));
        if ((g.dir > 0 && maxX > W - 6) || (g.dir < 0 && minX < 6)) {
          g.dir *= -1;
          for (const i of alive) i.y += 8;
        }
        const pace = g.speed + (18 - alive.length) * 2.2;
        for (const i of alive) i.x += g.dir * pace * dt;
        if (Math.random() < dt * (0.8 + (18 - alive.length) * 0.08) && alive.length) {
          const shooter = alive[Math.floor(Math.random() * alive.length)];
          g.bombs.push({ x: shooter.x + 7, y: shooter.y + 16, dy: 70 });
        }
        // Projectiles
        for (const s of g.shots) s.y += s.dy * dt;
        for (const b of g.bombs) b.y += b.dy * dt;
        for (const s of g.shots) {
          for (const i of alive) {
            if (i.alive && s.y > -10 && s.x >= i.x && s.x <= i.x + 16 && s.y >= i.y && s.y <= i.y + 16) {
              i.alive = false;
              s.y = -99;
              g.score += 10;
            }
          }
        }
        g.shots = g.shots.filter((s) => s.y > -8);
        g.hurt = Math.max(0, g.hurt - 1);
        g.bombs = g.bombs.filter((b) => {
          if (b.y > H) return false;
          if (g.hurt === 0 && b.y >= H - 22 && b.y <= H - 6 && b.x >= g.px && b.x <= g.px + 16) {
            g.lives -= 1;
            g.hurt = 60;
            return false;
          }
          return true;
        });
        const remaining = g.invaders.filter((i) => i.alive);
        if (remaining.length === 0) setP("won");
        else if (g.lives <= 0 || remaining.some((i) => i.y + 16 >= H - 24)) setP("lost");
        setScore(g.score);
      }
      draw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [draw, setP]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (phaseRef.current === "idle") return;
      if (["ArrowLeft", "ArrowRight", " "].includes(e.key) && phaseRef.current === "playing") e.preventDefault();
      if (e.key === "Escape") setP(phaseRef.current === "paused" ? "playing" : phaseRef.current === "playing" ? "paused" : phaseRef.current);
      keys.current[e.key] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [setP]);

  // Pause when the game scrolls out of view.
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && phaseRef.current === "playing") setP("paused");
    });
    io.observe(el);
    return () => io.disconnect();
  }, [setP]);

  const start = () => {
    game.current = newGame();
    keys.current = {};
    setScore(0);
    setP("playing");
    canvas.current?.focus();
  };

  const toCanvasX = (clientX: number) => {
    const rect = canvas.current!.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * W;
  };

  return (
    <div>
      <div
        className="arcade-stage"
        onPointerDown={(e) => {
          if (phaseRef.current !== "playing" || e.pointerType === "mouse") return;
          touchX.current = toCanvasX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (touchX.current !== null) touchX.current = toCanvasX(e.clientX);
        }}
        onPointerUp={() => (touchX.current = null)}
        onPointerCancel={() => (touchX.current = null)}
      >
        <canvas ref={canvas} width={W} height={H} tabIndex={-1} aria-label="Game night: a tiny shooter" />
        {phase !== "playing" ? (
          <div className="arcade-overlay">
            <p className="text-[15px] text-[#fff4d6]">
              {phase === "idle" && "Six dots. One tiny defender."}
              {phase === "paused" && "Paused. The family is waiting."}
              {phase === "won" && `Game night saved! Score ${score}.`}
              {phase === "lost" && `The family won this round. Score ${score}.`}
            </p>
            <button type="button" onClick={phase === "paused" ? () => setP("playing") : start} className="arcade-play" data-arcade-play>
              {phase === "idle" ? "Start a round" : phase === "paused" ? "Keep playing" : "Play again"} <ArrowUpRight className="size-4" />
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-[13px] text-[#c9c4e6]">
        <span>← → move · Space shoot · Esc pause</span>
        <span>On a phone? Hold and drag to fly and fire.</span>
      </div>
    </div>
  );
}
