import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { STOPS } from "../data/stops";
import { useProgress } from "../state/progress";
import { CompareSlider } from "../components/CompareSlider";
import { AudioPlayer } from "../components/AudioPlayer";
import { TaskForm } from "../components/TaskForm";
import { Button, Chip, Header } from "../components/ui";
import iconArchive from "../assets/icon-archive.svg";
import iconCompass from "../assets/icon-compass.svg";
import iconKeyhole from "../assets/icon-keyhole.svg";
import iconPin from "../assets/icon-pin.svg";
import iconQuestion from "../assets/icon-question.svg";

export function Stop() {
  const { id } = useParams();
  const stop = STOPS.find((s) => String(s.id) === id);
  const { progress, dispatch } = useProgress();
  const navigate = useNavigate();
  const [storyId, setStoryId] = useState(stop?.stories[0].id ?? "");
  const taskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stop && storyId) dispatch({ type: "viewTab", stopId: stop.id, storyId });
  }, [stop, storyId, dispatch]);

  useEffect(() => {
    // при переходе на другую остановку возвращаемся к первой вкладке и началу страницы
    setStoryId(stop?.stories[0].id ?? "");
    window.scrollTo(0, 0);
  }, [id]);

  if (!stop) return <Navigate to="/walk" replace />;

  const index = STOPS.indexOf(stop);
  const story = stop.stories.find((s) => s.id === storyId) ?? stop.stories[0];
  const multi = stop.stories.length > 1;
  const viewed = progress.viewedTabs[stop.id] ?? [];
  const allViewed = !multi || stop.stories.every((s) => viewed.includes(s.id));
  const isDone = progress.done.includes(stop.id);
  const attempts = progress.attempts[stop.id] ?? 0;
  const isLast = index === STOPS.length - 1;
  const closed = !isDone && !allViewed;
  const unseen = stop.stories.find((s) => !viewed.includes(s.id));

  const complete = () => {
    dispatch({ type: "complete", stopId: stop.id });
    navigate(`/stop/${stop.id}/done`);
  };

  return (
    <div className="screen screen--page">
      <Header number={index + 1} back />

      {multi && (
        <div className="tabs-wrap">
          <div className="tabs" role="tablist">
            {stop.stories.map((s) => (
              <button
                key={s.id}
                role="tab"
                type="button"
                aria-selected={s.id === story.id}
                className={`tabs__tab ${s.id === story.id ? "is-active" : ""}`}
                onClick={() => setStoryId(s.id)}
              >
                {s.tab}
              </button>
            ))}
          </div>
        </div>
      )}

      <CompareSlider
        then={story.then}
        now={story.now}
        alt={story.title}
        year={story.period.match(/\d{4}/)?.[0] ?? ""}
      />

      <div className="page">
        <div className="meta">
          <Chip>Виток II · {story.period}</Chip>
          <span className="meta__text">
            № {index + 1} / {STOPS.length}
          </span>
        </div>
        <h1 className="title-l">{story.title}</h1>
        <div className="address">
          <img src={iconPin} width={20} height={20} alt="" />
          <span>{story.address}</span>
        </div>

        <AudioPlayer src={story.audio} title="Слушать легенду" duration={story.audioDuration} />

        {story.legend && (
          <details className="legend">
            <summary>
              ТЕКСТ АУДИОЛЕГЕНДЫ
              <span className="legend__sign" aria-hidden />
            </summary>
            <p className="text-small">{story.legend}</p>
          </details>
        )}

        <p className="body">{story.text}</p>

        {multi && !allViewed && unseen && (
          <div className="info">
            <img src={iconCompass} width={24} height={24} alt="" />
            <p className="text-small">
              Вторая история — в Ленинском сквере, в 100 м. Откройте вкладку «{unseen.tab}», когда дойдёте.
            </p>
          </div>
        )}

        {multi && allViewed && !isDone && (
          <Button
            variant="secondary"
            down
            onClick={() => taskRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            К заданию
          </Button>
        )}

        <div className={`task ${closed ? "task--closed" : ""}`} ref={taskRef}>
          <div className="task__head">
            <img src={closed ? iconKeyhole : iconQuestion} width={24} height={24} alt="" />
            <span className="label">{closed ? "Задание закрыто" : "Задание"}</span>
          </div>
          {isDone ? (
            <>
              <p className="task__q">Задание выполнено ✓</p>
              <Button onClick={() => navigate(isLast ? "/finish" : "/walk")}>
                {isLast ? "К итогу" : "К следующей точке"}
              </Button>
            </>
          ) : closed ? (
            <p className="text-small">Откройте обе истории остановки, чтобы перейти к заданию.</p>
          ) : (
            <TaskForm
              key={stop.id}
              task={stop.task}
              attempts={attempts}
              onCorrect={complete}
              onWrong={() => dispatch({ type: "wrong", stopId: stop.id })}
            />
          )}
        </div>

        <a className="source" href={stop.source.url} target="_blank" rel="noopener noreferrer">
          <img src={iconArchive} width={18} height={18} alt="" />
          <span>Источник: {stop.source.label} ↗</span>
        </a>
      </div>
    </div>
  );
}
