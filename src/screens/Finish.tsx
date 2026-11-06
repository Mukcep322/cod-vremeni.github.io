import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { dataClass, FINAL_FACT, STOPS } from "../data/stops";
import { ROUTE_KM } from "../lib/geo";
import { useProgress } from "../state/progress";
import { Button, Chip } from "../components/ui";
import iconStar from "../assets/icon-star.svg";

// Фото для шапки финала. Положите файл в public/photos/ и впишите путь.
const FINAL_PHOTO = "photos/final.webp";

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
    <div className="screen screen--finish">
      <Chip mineral>Маршрут пройден ✓</Chip>
      <h1 className="hero">
        Маршрут
        <br />
        пройден
      </h1>
      <div className="mineral-text">Площадь Героев · Вечный огонь</div>

      {FINAL_PHOTO ? (
        <img className="final-photo" src={FINAL_PHOTO} alt="Площадь Героев, Вечный огонь" />
      ) : (
        <div className="final-photo final-photo--empty" role="img" aria-label="Фото будет добавлено">
          <span className="final-photo__tag">ФОТО · ЗАГЛУШКА</span>
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <b>
            {progress.done.length}/{STOPS.length}
          </b>
          <span>остановок</span>
        </div>
        <div className="stat">
          <b>{ROUTE_KM.toFixed(1).replace(".", ",")} км</b>
          <span>пешком</span>
        </div>
        <div className="stat">
          <b>{duration(progress.finishedAt - progress.startedAt)}</b>
          <span>в пути</span>
        </div>
      </div>

      <div className="name-card">
        <div className="task__head">
          <img src={iconStar} width={22} height={22} alt="" />
          <span className="label">У Вечного огня</span>
        </div>
        <label htmlFor="name" className="task__q">
          Найдите на плитах одно имя и запишите его
        </label>
        <input
          id="name"
          className="input"
          value={progress.name}
          onChange={(e) => dispatch({ type: "setName", name: e.target.value })}
          placeholder="Фамилия, имя"
          autoComplete="off"
        />
        <div className="name-card__note">Сохраняется только на этом телефоне</div>
      </div>

      <p className={dataClass(FINAL_FACT, "body")}>{FINAL_FACT}</p>

      <div className="sources">
        <div className="sources__title">Источники</div>
        <ul>
          {sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>

      <Button variant="accent" onClick={share}>
        Поделиться
      </Button>
      {shareNote && <div className="small center">{shareNote}</div>}
      <Button
        variant="secondary"
        onClick={() => {
          dispatch({ type: "reset" });
          navigate("/");
        }}
      >
        Пройти заново
      </Button>
    </div>
  );
}
