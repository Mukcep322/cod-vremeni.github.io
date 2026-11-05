import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { STOPS, stopCoords } from "../data/stops";
import { ARRIVAL_RADIUS_M, distanceM, formatDistance, walkMinutes, yandexWalkUrl } from "../lib/geo";
import { useGeolocation } from "../hooks/useGeolocation";
import { useProgress } from "../state/progress";
import { RouteMap } from "../components/RouteMap";
import { Chip, Segments } from "../components/ui";

// Остановки, на которые уже открывали экран автоматически в этой сессии,
// чтобы «← Карта» не возвращала участника обратно на точку.
const autoOpened = new Set<number>();

export function Walk() {
  const { progress } = useProgress();
  const navigate = useNavigate();
  const { pos, error } = useGeolocation(true);

  const index = progress.current;
  const target = STOPS[index];
  const targetCoords = target ? stopCoords(target) : null;

  const distance =
    targetCoords && pos
      ? distanceM([pos.lat, pos.lon], targetCoords)
      : targetCoords && index > 0
        ? distanceM(stopCoords(STOPS[index - 1]), targetCoords)
        : null;

  useEffect(() => {
    if (!target || !pos || distance === null) return;
    if (distance <= ARRIVAL_RADIUS_M && !autoOpened.has(target.id)) {
      autoOpened.add(target.id);
      navigate(`/stop/${target.id}`);
    }
  }, [target, pos, distance, navigate]);

  if (!progress.startedAt) return <Navigate to="/" replace />;
  if (!target || !targetCoords) return <Navigate to="/finish" replace />;

  const arrived = pos !== null && distance !== null && distance <= ARRIVAL_RADIUS_M;

  return (
    <div className="screen screen--map">
      <RouteMap me={pos} targetIndex={index} done={progress.done} focus="target" sheetShare={0.42} />

      <div className="float-progress">
        <div className="float-progress__label">
          Остановка {index + 1} из {STOPS.length}
        </div>
        <Segments done={progress.done.length} current={index} />
      </div>

      <section className="sheet sheet--walk">
        <span className="sheet__handle" aria-hidden />
        <div className="eyebrow">{arrived ? "Вы на месте" : "Следующая остановка"}</div>
        <h2 className="title-l">
          {target.id} · {target.title}
        </h2>
        <div className="chips">
          <Chip>{target.stories[0].address}</Chip>
          {distance !== null && <Chip>{formatDistance(distance)}</Chip>}
          {distance !== null && <Chip>≈ {walkMinutes(distance)} мин</Chip>}
        </div>
        <p className="hint">
          {error
            ? `${error}. Нажмите «Я на месте», когда дойдёте.`
            : pos
              ? `Отметка «на месте» сработает сама в ${ARRIVAL_RADIUS_M} м от точки`
              : "Определяем ваше местоположение…"}
        </p>
        <div className="grow" />
        <a className="btn btn--secondary" href={yandexWalkUrl(targetCoords)} target="_blank" rel="noopener noreferrer">
          Пешком в Яндекс.Картах ↗
        </a>
        <button type="button" className="btn btn--primary" onClick={() => navigate(`/stop/${target.id}`)}>
          Я на месте
        </button>
      </section>
    </div>
  );
}
