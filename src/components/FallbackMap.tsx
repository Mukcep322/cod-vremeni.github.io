import { useEffect, useRef, useState } from "react";
import { STOPS, stopCoords } from "../data/stops";
import type { Position } from "../hooks/useGeolocation";
import { markerState } from "../lib/markers";
import { MeMarker, Pin } from "./MapMarkers";
import grid from "../assets/map-grid.svg";
import river from "../assets/map-river.svg";
import parks from "../assets/map-parks.svg";
import streets from "../assets/map-streets.svg";
import route from "../assets/map-route.svg";

type Props = {
  me?: Position | null;
  targetIndex: number;
  done: number[];
  focus: "route" | "target";
  note: string;
};

// Схема из макета «Квест / Карта маршрута»: 390 × 423, не в масштабе
const W = 390;
const H = 423;
// Острия пинов на схеме, по порядку остановок
const TIPS: [number, number][] = [
  [70, 330],
  [170, 282],
  [232, 338],
  [302, 228],
  [238, 106],
];

// Перевод координат в схему: общее линейное приближение по пяти остановкам…
const linear = (lat: number, lon: number): [number, number] => {
  const dLat = lat - 52.61;
  const dLon = lon - 39.59;
  return [13026.1 * dLon + 290.8 * dLat + 142.1, -1009.7 * dLon - 15039.2 * dLat + 224.8];
};

// …и поправка к ближайшим остановкам: рядом с точкой участник стоит рядом с её пином
function toScheme(lat: number, lon: number): [number, number] {
  const [x, y] = linear(lat, lon);
  let sum = 0;
  let dx = 0;
  let dy = 0;
  STOPS.forEach((stop, i) => {
    const [sLat, sLon] = stopCoords(stop);
    const [px, py] = linear(sLat, sLon);
    const weight = 1 / ((px - x) ** 2 + (py - y) ** 2 + 1);
    sum += weight;
    dx += weight * (TIPS[i][0] - px);
    dy += weight * (TIPS[i][1] - py);
  });
  return [x + dx / sum, y + dy / sum];
}

/** Схема маршрута — пока нет ключа Яндекс Карт или карта не загрузилась */
export function FallbackMap({ me, targetIndex, done, note }: Props) {
  // схема заполняет контейнер целиком, как фон с cover
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0 && height > 0) setScale(Math.max(width / W, height / H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mePoint = me ? toScheme(me.lat, me.lon) : null;
  const meVisible = mePoint && mePoint[0] > 0 && mePoint[0] < W && mePoint[1] > 0 && mePoint[1] < H;

  return (
    <div className="map-fill" ref={boxRef}>
      <div
        className="scheme"
        role="img"
        aria-label="Схема маршрута"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <img className="scheme__layer" src={grid} width={W} height={H} alt="" />
        <img className="scheme__layer" src={river} width={W} height={H} alt="" />
        <img className="scheme__layer" src={parks} width={W} height={H} alt="" />
        <img className="scheme__streets" src={streets} width={357.25} height={426.356} alt="" />
        <img className="scheme__layer" src={route} width={W} height={H} alt="" />
        <div className="scheme__river">
          <span>Р. ВОРОНЕЖ</span>
        </div>
        {meVisible && mePoint && (
          <div className="scheme__point" style={{ left: mePoint[0], top: mePoint[1] }}>
            <MeMarker />
          </div>
        )}
        {STOPS.map((s, i) => (
          <div key={s.id} className="scheme__point" style={{ left: TIPS[i][0], top: TIPS[i][1] }}>
            <Pin number={s.id} state={markerState(i, targetIndex, done)} />
          </div>
        ))}
      </div>
      <div className="map-note">{note}</div>
    </div>
  );
}
