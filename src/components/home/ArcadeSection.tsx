import { Arcade, PixelSprite } from "@/components/home/Arcade";
import { KINDS } from "@/lib/characters";

// Fixed star field so server and browser render the same sky.
const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 37.3) % 100,
  top: (i * 53.7) % 72,
  big: i % 7 === 0,
}));

/** Pixel mountains along the bottom edge, drawn as stepped polygons. */
function Mountains() {
  const back = "0,150 0,90 40,90 40,70 80,70 80,50 110,50 110,66 150,66 150,40 180,40 180,24 205,24 205,44 240,44 240,60 280,60 280,36 320,36 320,56 360,56 360,30 395,30 395,52 430,52 430,72 470,72 470,46 505,46 505,28 530,28 530,48 570,48 570,64 610,64 610,40 650,40 650,58 690,58 690,34 720,34 720,54 760,54 760,74 800,74 800,150";
  const front = "0,150 0,110 30,110 30,98 70,98 70,86 100,86 100,100 140,100 140,90 170,90 170,104 210,104 210,94 250,94 250,84 290,84 290,100 330,100 330,92 370,92 370,106 410,106 410,96 450,96 450,86 490,86 490,98 530,98 530,90 570,90 570,104 610,104 610,92 650,92 650,100 690,100 690,88 730,88 730,102 770,102 770,94 800,94 800,150";
  return (
    <svg className="arcade-floor" viewBox="0 0 800 150" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      <polygon points={back} fill="#4b3f86" />
      <polygon points={front} fill="#6c5aa8" />
      <rect x="0" y="132" width="800" height="18" fill="#8a77c4" />
    </svg>
  );
}

export function ArcadeSection() {
  return (
    <section className="arcade" aria-labelledby="arcade-title">
      {STARS.map((s, i) => (
        <span key={i} className="pixel-star" style={{ left: `${s.left}%`, top: `${s.top}%`, transform: s.big ? "scale(1.6)" : undefined }} aria-hidden="true" />
      ))}
      {/* Pixel moon */}
      <svg viewBox="0 0 12 12" className="absolute -right-10 -top-6 w-[220px] max-w-[60%] opacity-90 max-sm:w-[140px]" shapeRendering="crispEdges" aria-hidden="true">
        {Array.from({ length: 12 }, (_, y) =>
          Array.from({ length: 12 }, (_, x) => {
            const d = Math.hypot(x - 5.5, y - 5.5);
            if (d > 5.6) return null;
            const crater = (x === 4 && y === 4) || (x === 7 && y === 7) || (x === 3 && y === 8);
            return <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={crater ? "#7e6bb8" : d > 4.6 ? "#8f7cc8" : "#a796dc"} />;
          }),
        )}
      </svg>
      <PixelSprite kind="spark" size={110} className="absolute left-[9%] top-[-34px] rotate-[-14deg] max-sm:left-[60%] max-sm:w-20" />
      <div className="wrap arcade-inner">
        <div>
          <p className="kicker !text-[#bdb6e6]">Side quest</p>
          <h2 id="arcade-title" className="mt-4">
            Put the charts down.
            <br />
            Play a round.
          </h2>
          <p className="mt-5 text-[16px] text-[#dcd8f5]">Every family needs a game night.</p>
          <div className="mt-7 flex gap-3">
            {KINDS.map((k) => (
              <PixelSprite key={k} kind={k} size={26} />
            ))}
          </div>
        </div>
        <Arcade />
      </div>
      <Mountains />
    </section>
  );
}
