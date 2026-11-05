import { STOPS, stopCoords } from "../data/stops";

/** Расстояние между двумя точками в метрах (формула гаверсинуса) */
export function distanceM(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Радиус, в котором участник считается «на месте» */
export const ARRIVAL_RADIUS_M = 50;

/** Примерное время пешком: 4,5 км/ч и поправка 1,3 на изгибы улиц */
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(((meters * 1.3) / 4500) * 60));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} м`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} км`;
}

/** Длина маршрута по прямой между остановками, км */
export const ROUTE_KM = (() => {
  let m = 0;
  for (let i = 0; i < STOPS.length - 1; i++) m += distanceM(stopCoords(STOPS[i]), stopCoords(STOPS[i + 1]));
  return m / 1000;
})();

/** Ссылка на пешеходный маршрут в Яндекс.Картах от текущего места до точки */
export function yandexWalkUrl(to: [number, number]): string {
  return `https://yandex.ru/maps/?rtext=~${to[0]},${to[1]}&rtt=pd`;
}

/** Нормализация ответа: регистр, ё/е, пробелы и знаки препинания */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[\s.,!?;:«»"'()-]+/g, "")
    .trim();
}
