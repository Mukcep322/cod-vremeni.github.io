import { Navigate, useNavigate, useParams } from "react-router-dom";
import { STOPS } from "../data/stops";
import { useProgress } from "../state/progress";
import { Segments, StatusSpacer, TopBar } from "../components/ui";

export function Done() {
  const { id } = useParams();
  const stop = STOPS.find((s) => String(s.id) === id);
  const { progress } = useProgress();
  const navigate = useNavigate();

  if (!stop) return <Navigate to="/walk" replace />;
  const index = STOPS.indexOf(stop);
  const isLast = index === STOPS.length - 1;

  return (
    <div className="screen screen--page">
      <StatusSpacer />
      <TopBar right={`${index + 1} из ${STOPS.length}`} />
      <div className="page page--fill">
        <svg className="check" width="72" height="72" viewBox="0 0 72 72" aria-hidden>
          <circle cx="36" cy="36" r="34" />
          <path d="M22 37 32 47 51 27" />
        </svg>
        <h1 className="title-xl">Верно!</h1>
        <p className="body">{stop.task.reward}</p>
        <div className="stack stack--tight">
          <div className="small strong">
            Пройдено {progress.done.length} из {STOPS.length} остановок
          </div>
          <Segments done={progress.done.length} />
        </div>
        <div className="grow" />
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate(isLast || progress.finishedAt ? "/finish" : "/walk")}
        >
          {isLast ? "К итогу маршрута" : "К следующей точке"}
        </button>
        <button type="button" className="btn btn--secondary" onClick={() => navigate(`/stop/${stop.id}`)}>
          Остаться на этой точке
        </button>
      </div>
    </div>
  );
}
