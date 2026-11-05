import { useEffect, useMemo, useState } from "react";
import { STOPS, stopCoords } from "../data/stops";
import { loadYMaps, YMAPS_KEY, type YMapsKit } from "../lib/ymaps";
import type { Position } from "../hooks/useGeolocation";
import { ErrorBoundary } from "./ErrorBoundary";
import { FallbackMap } from "./FallbackMap";
import { MeMarker, Pin } from "./MapMarkers";
import { markerState } from "../lib/markers";

type Props = {
  me?: Position | null;
  /** Индекс остановки, к которой идёт участник; -1 — показать весь маршрут без цели */
  targetIndex: number;
  done: number[];
  /** "route" — весь маршрут, "target" — приблизить к цели */
  focus: "route" | "target";
};

export function RouteMap(props: Props) {
  const [kit, setKit] = useState<YMapsKit | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(YMAPS_KEY ? "loading" : "fallback");

  useEffect(() => {
    if (!YMAPS_KEY) return;
    let alive = true;
    loadYMaps().then((k) => {
      if (!alive) return;
      setKit(k);
      setStatus(k ? "ready" : "fallback");
    });
    return () => {
      alive = false;
    };
  }, []);

  const failedNote = YMAPS_KEY ? "Схема маршрута · карта не загрузилась" : "Схема маршрута · добавьте ключ Яндекс Карт";

  if (status === "ready" && kit) {
    return (
      <ErrorBoundary fallback={<FallbackMap {...props} note={failedNote} />}>
        <YandexRouteMap kit={kit} {...props} />
      </ErrorBoundary>
    );
  }
  return <FallbackMap {...props} note={status === "loading" ? "Загружаем карту…" : failedNote} />;
}

// Карта лежит в .map-area над шторкой: логотип, копирайты и кнопку «Открыть в Картах»
// по условиям API перекрывать нельзя
function YandexRouteMap({ kit, me, targetIndex, done, focus }: Props & { kit: YMapsKit }) {
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapFeature } = kit;
  const coords = STOPS.map(stopCoords);
  const line = coords.map(([lat, lon]) => [lon, lat]);

  const location = useMemo(() => {
    if (focus === "target" && targetIndex >= 0 && targetIndex < STOPS.length) {
      const [lat, lon] = coords[targetIndex];
      return { center: [lon, lat], zoom: 16, duration: 400 };
    }
    const lats = coords.map((c) => c[0]);
    const lons = coords.map((c) => c[1]);
    const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const cLon = (Math.min(...lons) + Math.max(...lons)) / 2;
    return { center: [cLon, cLat], zoom: 14, duration: 400 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, targetIndex]);

  return (
    <div className="map-fill">
      <YMap location={location} mode="vector">
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapFeature
          geometry={{ type: "LineString", coordinates: line }}
          style={{ stroke: [{ color: "#0A5C49", width: 4, dash: [8, 8] }] }}
        />
        {me && (
          <YMapMarker coordinates={[me.lon, me.lat]}>
            <MeMarker />
          </YMapMarker>
        )}
        {STOPS.map((s, i) => (
          <YMapMarker key={s.id} coordinates={[coords[i][1], coords[i][0]]}>
            <Pin number={s.id} state={markerState(i, targetIndex, done)} />
          </YMapMarker>
        ))}
      </YMap>
    </div>
  );
}
