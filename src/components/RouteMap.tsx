import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { STOPS, stopCoords } from "../data/stops";
import { loadYMaps, YMAPS_KEY, type YMapsKit } from "../lib/ymaps";
import type { Position } from "../hooks/useGeolocation";
import { ErrorBoundary } from "./ErrorBoundary";
import { FallbackMap } from "./FallbackMap";
import { markerState } from "../lib/markers";

type Props = {
  me?: Position | null;
  /** Индекс остановки, к которой идёт участник; -1 — показать весь маршрут без цели */
  targetIndex: number;
  done: number[];
  /** "route" — весь маршрут, "target" — приблизить к цели */
  focus: "route" | "target";
  /** Сдвиг центра вниз, чтобы цель не пряталась под шторкой (доля высоты экрана) */
  sheetShare?: number;
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

function YandexRouteMap({ kit, me, targetIndex, done, focus }: Props & { kit: YMapsKit }) {
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapFeature } = kit;
  const coords = STOPS.map(stopCoords);
  const line = coords.map(([lat, lon]) => [lon, lat]);

  // Карта заканчивается над шторкой: по условиям API логотип, копирайты
  // и кнопку «Открыть в Картах» нельзя перекрывать
  const boxRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  useLayoutEffect(() => {
    const sheet = boxRef.current?.parentElement?.querySelector<HTMLElement>(".sheet");
    if (!sheet) return;
    const update = () => setSheetHeight(sheet.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(sheet);
    return () => ro.disconnect();
  }, []);

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
    <div className="map-fill" ref={boxRef} style={{ bottom: sheetHeight }}>
      <YMap location={location} mode="vector">
        <YMapDefaultSchemeLayer />
        <YMapDefaultFeaturesLayer />
        <YMapFeature
          geometry={{ type: "LineString", coordinates: line }}
          style={{ stroke: [{ color: "#232826", width: 3, dash: [8, 6] }] }}
        />
        {STOPS.map((s, i) => (
          <YMapMarker key={s.id} coordinates={[coords[i][1], coords[i][0]]}>
            <div className={`marker marker--${markerState(i, targetIndex, done)}`}>{s.id}</div>
          </YMapMarker>
        ))}
        {me && (
          <YMapMarker coordinates={[me.lon, me.lat]}>
            <div className="me" aria-label="Вы здесь" />
          </YMapMarker>
        )}
      </YMap>
    </div>
  );
}
