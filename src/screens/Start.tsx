import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { INTRO, STOPS } from "../data/stops";
import { ROUTE_KM } from "../lib/geo";
import { useProgress } from "../state/progress";
import { RouteMap } from "../components/RouteMap";
import { Chip, Segments } from "../components/ui";

const PLACES = STOPS.reduce((n, s) => n + s.stories.length, 0);

export function Start() {
  const { progress, dispatch } = useProgress();
  const navigate = useNavigate();
  const inProgress = !!progress.startedAt && !progress.finishedAt;
  const finished = !!progress.finishedAt;
  const [modalOpen, setModalOpen] = useState(inProgress || finished);

  const begin = () => {
    dispatch({ type: "start" });
    navigate("/walk");
  };

  return (
    <div className="screen screen--map">
      <RouteMap targetIndex={-1} done={progress.done} focus="route" sheetShare={0.48} />
      <section className="sheet sheet--start">
        <span className="sheet__handle" aria-hidden />
        <div className="eyebrow">Пеший квест · Липецк · 1941–1945</div>
        <h1 className="title-xl">Улицы в военное время</h1>
        <div className="chips">
          <Chip>{PLACES} мест</Chip>
          <Chip>{ROUTE_KM.toFixed(1).replace(".", ",")} км</Chip>
          <Chip>≈ 1,5 ч</Chip>
        </div>
        <p className="lead">{INTRO}</p>
        <div className="grow" />
        <button type="button" className="btn btn--primary" onClick={begin}>
          Начать маршрут
        </button>
      </section>

      {modalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="resume-title">
          <div className="modal">
            {inProgress ? (
              <>
                <h2 id="resume-title" className="title-m">
                  Продолжить маршрут?
                </h2>
                <p className="muted">
                  Вы остановились на остановке {progress.current + 1} · {STOPS[progress.current]?.title}. Пройдено{" "}
                  {progress.done.length} из {STOPS.length}.
                </p>
                <Segments done={progress.done.length} current={progress.current} />
                <button type="button" className="btn btn--primary" onClick={() => navigate("/walk")}>
                  Продолжить
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    dispatch({ type: "reset" });
                    setModalOpen(false);
                  }}
                >
                  Начать заново
                </button>
              </>
            ) : (
              <>
                <h2 id="resume-title" className="title-m">
                  Маршрут пройден
                </h2>
                <p className="muted">Можно посмотреть итог или пройти маршрут ещё раз.</p>
                <button type="button" className="btn btn--primary" onClick={() => navigate("/finish")}>
                  Посмотреть итог
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    dispatch({ type: "reset" });
                    setModalOpen(false);
                  }}
                >
                  Пройти заново
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
