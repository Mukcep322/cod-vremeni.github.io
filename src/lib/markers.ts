import { STOPS } from "../data/stops";

export type MarkerState = "done" | "target" | "next";

export function markerState(index: number, targetIndex: number, done: number[]): MarkerState {
  if (done.includes(STOPS[index].id)) return "done";
  if (index === targetIndex) return "target";
  return "next";
}
