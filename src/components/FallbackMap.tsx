import { useEffect, useRef, useState } from "react";
import { STOPS, stopCoords } from "../data/stops";
import type { Position } from "../hooks/useGeolocation";
import { markerState } from "../lib/markers";

type Props = {
  me?: Position | null;
  targetIndex: number;
  done: number[];
  focus: "route" | "target";
  sheetShare?: number;
  note: string;
};

/** Схема маршрута в реальных координатах — пока нет ключа Яндекс Карт */
export function FallbackMap({ me, targetIndex, done, sheetShare = 0.4, note }: Props) {
  // схема рисуется в реальном размере контейнера, чтобы точки не уходили под шторку
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 844 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const W = size.w;
  const H = size.h;
  const coords = STOPS.map(stopCoords);
  const lat0 = 52.61;
  const kx = 111.32 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110.57;
  const proj = (c: [number, number]) => ({ x: c[1] * kx, y: -c[0] * ky });
  const pts = coords.map(proj);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const pad = 46;
  const top = 128; // место под плашку прогресса
  const usableH = H * (1 - sheetShare) - top - 110;
  const scale = Math.min((W - pad * 2) / (Math.max(...xs) - Math.min(...xs)), usableH / (Math.max(...ys) - Math.min(...ys)));
  const ox = (W - (Math.max(...xs) - Math.min(...xs)) * scale) / 2;
  const toPx = (p: { x: number; y: number }) => ({
    x: ox + (p.x - Math.min(...xs)) * scale,
    y: top + (p.y - Math.min(...ys)) * scale,
  });
  const px = pts.map(toPx);
  const mePx = me ? toPx(proj([me.lat, me.lon])) : null;
  const meVisible = mePx && mePx.x > 0 && mePx.x < W && mePx.y > 0 && mePx.y < H;
  const grid = Math.max(20, 0.25 * scale); // линия сетки каждые 250 м

  return (
    <div className="map-fill map-fallback" ref={boxRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Схема маршрута">
        <defs>
          <pattern id="grid" width={grid} height={grid} patternUnits="userSpaceOnUse">
            <path d={`M ${grid} 0 L 0 0 0 ${grid}`} fill="none" className="grid-line" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        <path
          className="route-line"
          d={"M" + px.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L")}
        />
        {px.map((p, i) => {
          const state = markerState(i, targetIndex, done);
          // подпись слева у правого края, под маркером — если рядом другой маркер
          const left = p.x > W * 0.6;
          const crowded = px.some((q, j) => j < i && Math.hypot(q.x - p.x, q.y - p.y) < 48);
          return (
            <g key={STOPS[i].id} transform={`translate(${p.x} ${p.y})`} className={`svg-marker svg-marker--${state}`}>
              <circle r={state === "target" ? 17 : 14} />
              <text textAnchor="middle" dy="4.5">
                {STOPS[i].id}
              </text>
              <text
                className="svg-marker__label"
                x={crowded ? 0 : left ? -22 : 22}
                dy={crowded ? 34 : 4.5}
                textAnchor={crowded ? "middle" : left ? "end" : "start"}
              >
                {STOPS[i].short}
              </text>
            </g>
          );
        })}
        {meVisible && mePx && (
          <g transform={`translate(${mePx.x} ${mePx.y})`}>
            <circle r={18} className="svg-me-halo" />
            <circle r={7} className="svg-me" />
          </g>
        )}
      </svg>
      <div className="map-note" style={{ top: top - 44 }}>
        {note}
      </div>
    </div>
  );
}
