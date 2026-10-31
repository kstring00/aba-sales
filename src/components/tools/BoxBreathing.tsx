"use client";

import { useEffect, useRef, useState } from "react";
import { ui } from "@/lib/content/data";

const T = ui.tools.breathe;
const SIDE = 160; // svg units

/**
 * Box breathing. A dot travels the square: one side per phase. Motion is a
 * transform on the dot only (GPU-friendly). Under reduced motion the dot
 * stays put and a large countdown carries the timing. Phase changes are
 * announced politely; vibration is off by default and feature-detected.
 */
export function BoxBreathing({ together = false }: { together?: boolean }) {
  const [running, setRunning] = useState(false);
  const [pace, setPace] = useState(4);
  const [phase, setPhase] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [rounds, setRounds] = useState(0);
  const [vibrate, setVibrate] = useState(false);
  const [canVibrate, setCanVibrate] = useState(false);
  const [reduced, setReduced] = useState(false);
  const dot = useRef<SVGCircleElement>(null);
  const raf = useRef<number | null>(null);
  const start = useRef(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setCanVibrate(typeof navigator !== "undefined" && "vibrate" in navigator);
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!running) return;
    start.current = performance.now();
    let lastPhase = -1;
    let lastSecond = -1;
    const tick = (now: number) => {
      const elapsed = (now - start.current) / 1000;
      const cycle = pace * 4;
      const inCycle = elapsed % cycle;
      const p = Math.floor(inCycle / pace);
      const t = (inCycle - p * pace) / pace; // 0..1 along the side
      if (p !== lastPhase) {
        if (lastPhase === 3 && p === 0) setRounds((r) => r + 1);
        lastPhase = p;
        setPhase(p);
        if (vibrate && canVibrate) navigator.vibrate?.(40);
      }
      const sec = Math.ceil(pace - (inCycle - p * pace));
      if (sec !== lastSecond) {
        lastSecond = sec;
        setSecondsLeft(sec);
      }
      if (dot.current && !reduced) {
        // in: up the left side · hold: across the top · out: down the right · hold: along the bottom
        const pts = [
          [0, SIDE - SIDE * t],
          [SIDE * t, 0],
          [SIDE, SIDE * t],
          [SIDE - SIDE * t, SIDE],
        ][p];
        dot.current.style.transform = `translate(${pts[0]}px, ${pts[1]}px)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [running, pace, vibrate, canVibrate, reduced]);

  function toggle() {
    if (running) {
      setRunning(false);
      if (dot.current) dot.current.style.transform = `translate(0px, ${SIDE}px)`;
      setPhase(0);
      setSecondsLeft(pace);
    } else {
      setRounds(0);
      setRunning(true);
    }
  }

  const labels = together ? T.phasesTogether : T.phases;
  const size = together ? "max-w-[min(88vw,26rem)]" : "max-w-[min(80vw,20rem)]";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className={`relative w-full ${size}`}>
        <svg viewBox={`-20 -20 ${SIDE + 40} ${SIDE + 40}`} className="h-auto w-full" aria-hidden>
          <rect x="0" y="0" width={SIDE} height={SIDE} rx="14" fill="var(--sage-tint)" stroke="var(--accent)" strokeWidth={together ? 5 : 3} />
          {/* the side currently being traced */}
          {running ? (
            <line
              {...[
                { x1: 0, y1: SIDE, x2: 0, y2: 0 },
                { x1: 0, y1: 0, x2: SIDE, y2: 0 },
                { x1: SIDE, y1: 0, x2: SIDE, y2: SIDE },
                { x1: SIDE, y1: SIDE, x2: 0, y2: SIDE },
              ][phase]}
              stroke="var(--accent-text)"
              strokeWidth={together ? 8 : 6}
              strokeLinecap="round"
            />
          ) : null}
          <circle ref={dot} data-breath-dot cx="0" cy="0" r={together ? 14 : 10} fill="var(--clay-bright)" style={{ transform: `translate(0px, ${SIDE}px)` }} />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p aria-live="polite" className={`font-display text-heading ${together ? "text-[clamp(2rem,8vw,3rem)]" : "text-[clamp(1.6rem,6vw,2.4rem)]"}`}>
            {running ? labels[phase] : T.ready}
          </p>
          {running ? <p className={`tnum mt-1 text-ink-soft ${reduced || together ? "text-[2.4rem] font-display" : "text-[1.2rem]"}`} aria-hidden>{secondsLeft}</p> : null}
        </div>
      </div>

      <button type="button" onClick={toggle} className={`sd-btn ${running ? "" : "primary"} min-w-40 ${together ? "!min-h-14 !text-[18px]" : ""}`} aria-pressed={running}>
        {running ? T.stop : T.start}
      </button>

      <div className="grid w-full max-w-sm gap-4 text-[15px] text-ink-soft">
        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between">
            {T.pace}
            <output className="tnum font-medium text-ink">{pace}</output>
          </span>
          <input type="range" min={3} max={6} step={1} value={pace} onChange={(e) => setPace(Number(e.target.value))} className="h-11 accent-[var(--accent-text)]" />
        </label>
        <p className="tnum" aria-live="off">{T.rounds}: <span className="font-medium text-ink">{rounds}</span></p>
        {canVibrate ? (
          <label className="flex min-h-11 items-center gap-3">
            <input type="checkbox" checked={vibrate} onChange={(e) => setVibrate(e.target.checked)} className="h-6 w-6 accent-[var(--accent-text)]" />
            {T.vibrate}
          </label>
        ) : null}
      </div>
    </div>
  );
}
