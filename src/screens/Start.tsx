import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { INTRO, STOPS } from "../data/stops";
import { ROUTE_LENGTH } from "../lib/geo";
import { useProgress } from "../state/progress";
import { RouteMap } from "../components/RouteMap";
import { Button, Chip, Header, Segments } from "../components/ui";
import logoMark from "../assets/logo-mark.svg";

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

  const reset = () => {
    dispatch({ type: "reset" });
    setModalOpen(false);
  };

  if (modalOpen) {
    return (
      <div className="screen screen--map">
        <Header number={progress.current + 1} />
        <div className="map-area">
          <RouteMap targetIndex={progress.current} done={progress.done} focus="route" />
        </div>
        <div className="sheet sheet--blank" />

        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="resume-title">
          <div className="modal">
            <div className="label">Прогресс сохранён</div>
            {inProgress ? (
              <>
                <h2 id="resume-title" className="title-l">
                  Продолжить маршрут?
                </h2>
                <p className="text-small">
                  Вы остановились на остановке {progress.current + 1} · {STOPS[progress.current]?.title}. Пройдено{" "}
                  {progress.done.length} из {STOPS.length}.
                </p>
                <Segments done={progress.done.length} current={progress.current} />
                <Button onClick={() => navigate("/walk")}>Продолжить</Button>
                <Button variant="secondary" onClick={reset}>
                  Начать заново
                </Button>
              </>
            ) : (
              <>
                <h2 id="resume-title" className="title-l">
                  Маршрут пройден
                </h2>
                <p className="text-small">Можно посмотреть итог или пройти маршрут ещё раз.</p>
                <Button onClick={() => navigate("/finish")}>Посмотреть итог</Button>
                <Button variant="secondary" onClick={reset}>
                  Пройти заново
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen--start">
      <div className="logo">
        <img src={logoMark} width={44.16} height={44.16} alt="" />
        <div className="logo__text">
          КРАЕВЕДЧЕСКИЕ
          <br />
          ТАЙНИКИ
        </div>
      </div>
      <div className="rule" />
      <Chip>Виток II · 1941–1945</Chip>
      <h1 className="hero">
        Маршрут
        <br />
        Победы
      </h1>
      <section className="route-card">
        <div className="route-card__head">
          <div className="route-card__row">
            <span className="label">Маршрут · центр</span>
            <span className="route-card__tag">Старт здесь</span>
          </div>
          <div className="route-card__title">
            Центр
            <br />
            Липецка
          </div>
        </div>
        <div className="route-card__stats">
          <div className="route-card__stat">
            <b>{STOPS.length}</b>
            <span>остановок</span>
          </div>
          <div className="route-card__stat">
            <b>{ROUTE_LENGTH}</b>
            <span>пешком</span>
          </div>
          <div className="route-card__stat">
            <b>1,5 ч</b>
            <span>с остановками</span>
          </div>
        </div>
        <div className="route-card__body">
          <p className="text-small">{INTRO}</p>
          <Button onClick={begin}>Начать маршрут</Button>
        </div>
      </section>
    </div>
  );
}
