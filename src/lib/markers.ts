import { STOPS } from "../data/stops";
import type { Position } from "../hooks/useGeolocation";

export type MarkerState = "done" | "target" | "next";

/** Общие свойства карты Яндекса и схемы маршрута */
export type MapProps = {
  me?: Position | null;
  /** Индекс остановки, к которой идёт участник */
  targetIndex: number;
  done: number[];
  /** "route" — весь маршрут, "target" — приблизить к цели */
  focus: "route" | "target";
};

export function markerState(index: number, targetIndex: number, done: number[]): MarkerState {
  if (done.includes(STOPS[index].id)) return "done";
  if (index === targetIndex) return "target";
  return "next";
}
