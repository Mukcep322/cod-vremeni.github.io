import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FINAL_FACT, STOPS } from "../data/stops";
import { ROUTE_KM } from "../lib/geo";
import { useProgress } from "../state/progress";
import { Chip, StatusSpacer } from "../components/ui";

// Фото для шапки финала. Положите файл в public/photos/ и впишите путь.
const FINAL_PHOTO = "";

function duration(ms: number) {
  const min = Math.max(1, Math.round(ms / 60000));
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;
}

export function Finish() {
  const { progress, dispatch } = useProgress();
  const navigate = useNavigate();
  const [shareNote, setShareNote] = useState("");

  if (!progress.startedAt) return <Navigate to="/" replace />;
  if (!progress.finishedAt) return <Navigate to="/walk" replace />;

  const sources = Array.from(new Map(STOPS.map((s) => [s.source.url, s.source])).values());

  const share = async () => {
    const url = window.location.href.split("#")[0];
    const data = { title: "Улицы в военное время", text: "Пеший маршрут по Липецку 1941–1945", url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Ссылка скопирована");
    } catch {
      setShareNote(url);
    }
  };

  return (
    <div className="screen screen--page">
      <StatusSpacer />
      <div className="page">
        {FINAL_PHOTO ? (
          <img className="hero" src={FINAL_PHOTO} alt="Площадь Героев, Вечный огонь" />
        ) : (
          <div className="hero picture--empty" role="img" aria-label="Фото будет добавлено">
            <span>Фото площади Героев появится здесь</span>
          </div>
        )}
        <div className="stack">
          <Chip dark>Маршрут пройден</Chip>
          <h1 className="title-l">Улицы в военное время</h1>
        </div>
        <div className="stats">
          <div className="stat">
            <b>
              {progress.done.length}/{STOPS.length}
            </b>
            <span>остановок</span>
          </div>
          <div className="stat">
            <b>{ROUTE_KM.toFixed(1).replace(".", ",")}</b>
            <span>км</span>
          </div>
          <div className="stat">
            <b>{duration(progress.finishedAt - progress.startedAt)}</b>
            <span>в пути</span>
          </div>
        </div>

        <div className="task">
          <label htmlFor="name" className="task__q">
            Найдите на плитах у Вечного огня одно имя и запишите его
          </label>
          <input
            id="name"
            className="input"
            value={progress.name}
            onChange={(e) => dispatch({ type: "setName", name: e.target.value })}
            placeholder="Фамилия, имя"
            autoComplete="off"
          />
          {progress.name.trim() && <div className="muted small">Сохранено только на этом телефоне</div>}
        </div>

        <p className="body muted">{FINAL_FACT}</p>

        <details className="sources">
          <summary>Источники маршрута</summary>
          <ul>
            {sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </details>

        <button type="button" className="btn btn--primary" onClick={share}>
          Поделиться маршрутом
        </button>
        {shareNote && <div className="muted small center">{shareNote}</div>}
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            dispatch({ type: "reset" });
            navigate("/");
          }}
        >
          Пройти заново
        </button>
      </div>
    </div>
  );
}
