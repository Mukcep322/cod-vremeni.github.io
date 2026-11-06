import { Navigate, useNavigate, useParams } from "react-router-dom";
import { STOPS, stopCoords } from "../data/stops";
import { displayAnswer } from "../lib/answers";
import { distanceM, formatDistance, walkMinutes } from "../lib/geo";
import { useProgress } from "../state/progress";
import { Button, Chip, Segments } from "../components/ui";

export function Done() {
  const { id } = useParams();
  const stop = STOPS.find((s) => String(s.id) === id);
  const { progress } = useProgress();
  const navigate = useNavigate();

  if (!stop) return <Navigate to="/walk" replace />;
  const index = STOPS.indexOf(stop);
  const isLast = index === STOPS.length - 1;
  const next = STOPS[index + 1];
  const toNext = next ? distanceM(stopCoords(stop), stopCoords(next)) : 0;

  const { reward } = stop.task;

  return (
    <div className="screen screen--done">
      <Chip mineral>Верно ✓</Chip>
      <h1 className="hero">
        Ответ
        <br />
        принят!
      </h1>
      <div className="mineral-text">
        Остановка {index + 1} из {STOPS.length} пройдена
      </div>
      <Segments done={progress.done.length} />

      <div className="answer-card">
        <div className="label">Ответ</div>
        <p className="answer-card__title">{displayAnswer(stop.task)}</p>
        <div className="answer-card__rule" />
        <p className="text-small">{reward}</p>
      </div>

      {next && !progress.finishedAt && (
        <div className="next-box">
          <div className="mineral-text">
            Далее · {formatDistance(toNext)} · ≈ {walkMinutes(toNext)} мин
          </div>
          <div className="next-box__title">
            {next.id} · {next.title}
          </div>
        </div>
      )}

      <div className="grow" />
      <Button variant="accent" onClick={() => navigate(isLast || progress.finishedAt ? "/finish" : "/walk")}>
        {isLast ? "К итогу маршрута" : "К следующей точке"}
      </Button>
      <Button variant="secondary" onClick={() => navigate(`/stop/${stop.id}`)}>
        Остаться на точке
      </Button>
    </div>
  );
}
