import { useEffect, useMemo, useState } from "react";
import { STOPS, stopCoords } from "../data/stops";
import { loadYMaps, YMAPS_KEY, type YMapsKit } from "../lib/ymaps";
import { ErrorBoundary } from "./ErrorBoundary";
import { FallbackMap } from "./FallbackMap";
import { MeMarker, Pin } from "./MapMarkers";
import { markerState, type MapProps } from "../lib/markers";

// Координаты в порядке Яндекса: [долгота, широта]
const COORDS = STOPS.map((stop) => {
  const [lat, lon] = stopCoords(stop);
  return [lon, lat];
});

/** Вид на весь маршрут: центр охватывающего прямоугольника */
function routeCenter() {
  const lons = COORDS.map((c) => c[0]);
  const lats = COORDS.map((c) => c[1]);
  return [(Math.min(...lons) + Math.max(...lons)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2];
}

export function RouteMap(props: MapProps) {
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

  const noKeyNote = import.meta.env.DEV ? "Схема маршрута · добавьте ключ Яндекс Карт" : "Схема маршрута";
  const failedNote = YMAPS_KEY ? "Схема маршрута · карта не загрузилась" : noKeyNote;

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
function YandexRouteMap({ kit, me, targetIndex, done, focus }: MapProps & { kit: YMapsKit }) {
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapFeature } = kit;

  const location = useMemo(() => {
    const target = focus === "target" ? COORDS[targetIndex] : undefined;
    return target
      ? { center: target, zoom: 16, duration: 400 }
      : { center: routeCenter(), zoom: 14, duration: 400 };
  }, [focus, targetIndex]);

  return (
    <div className="map-fill">
      <YMap location={location} mode="vector">
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapFeature
          geometry={{ type: "LineString", coordinates: COORDS }}
          style={{ stroke: [{ color: "#0A5C49", width: 4, dash: [8, 8] }] }}
        />
        {me && (
          <YMapMarker coordinates={[me.lon, me.lat]}>
            <MeMarker />
          </YMapMarker>
        )}
        {STOPS.map((s, i) => (
          <YMapMarker key={s.id} coordinates={COORDS[i]}>
            <Pin number={s.id} state={markerState(i, targetIndex, done)} />
          </YMapMarker>
        ))}
      </YMap>
    </div>
  );
}
