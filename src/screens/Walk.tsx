import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { STOPS, stopCoords } from "../data/stops";
import { ARRIVAL_RADIUS_M, distanceM, formatDistance, walkMinutes, yandexWalkUrl } from "../lib/geo";
import { useGeolocation } from "../hooks/useGeolocation";
import { useProgress } from "../state/progress";
import { RouteMap } from "../components/RouteMap";
import { Button, Chip, Header } from "../components/ui";

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
  const status = error
    ? `${error}. Нажмите «Я на месте», когда дойдёте.`
    : pos
      ? `сработает сама в ${ARRIVAL_RADIUS_M} м`
      : "определяем ваше местоположение…";

  return (
    <div className="screen screen--map">
      <Header number={index + 1} />
      <div className="map-area">
        <RouteMap me={pos} targetIndex={index} done={progress.done} focus="target" />
      </div>

      <section className="sheet">
        <span className="sheet__handle" aria-hidden />
        <div className="meta">
          <Chip>Виток II · {target.stories[0].period}</Chip>
          <span className="meta__text">
            {arrived
              ? "Вы на месте"
              : distance !== null
                ? `${formatDistance(distance)} · ≈ ${walkMinutes(distance)} мин`
                : "Следующая остановка"}
          </span>
        </div>
        <h2 className="title-sheet">
          {target.id} · {target.title}
        </h2>
        <p className="text-small">
          {target.stories[0].address} · {status}
        </p>
        <Button onClick={() => navigate(`/stop/${target.id}`)}>Я на месте</Button>
        <Button variant="secondary" href={yandexWalkUrl(targetCoords)}>
          В Яндекс.Картах
        </Button>
      </section>
    </div>
  );
}
