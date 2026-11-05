import { useEffect, useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { STOPS } from "../data/stops";
import { normalizeAnswer } from "../lib/geo";
import { useProgress } from "../state/progress";
import { CompareSlider } from "../components/CompareSlider";
import { AudioPlayer } from "../components/AudioPlayer";
import { Chip, StatusSpacer, TopBar } from "../components/ui";

const MAX_ATTEMPTS = 3;

export function Stop() {
  const { id } = useParams();
  const stop = STOPS.find((s) => String(s.id) === id);
  const { progress, dispatch } = useProgress();
  const navigate = useNavigate();
  const [storyId, setStoryId] = useState(stop?.stories[0].id ?? "");
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const taskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stop && storyId) dispatch({ type: "viewTab", stopId: stop.id, storyId });
  }, [stop, storyId, dispatch]);

  useEffect(() => {
    // при переходе на другую остановку сбрасываем вкладку и поле ответа
    setStoryId(stop?.stories[0].id ?? "");
    setAnswer("");
    setWrong(false);
    setHintOpen(false);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const complete = () => {
    dispatch({ type: "complete", stopId: stop.id });
    navigate(`/stop/${stop.id}/done`);
  };

  const check = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    const ok = stop.task.answers.some((a) => normalizeAnswer(a) === normalizeAnswer(answer));
    if (ok) {
      complete();
    } else {
      dispatch({ type: "wrong", stopId: stop.id });
      setWrong(true);
    }
  };

  return (
    <div className="screen screen--page">
      <StatusSpacer />
      <TopBar right={`${index + 1} из ${STOPS.length}`} />

      <div className="page">
        {multi && (
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
        )}

        <CompareSlider then={story.then} now={story.now} alt={story.title} />

        <div className="stack">
          <Chip>{story.period}</Chip>
          <h1 className="title-l">{story.title}</h1>
          <div className="muted small">{story.address}</div>
        </div>

        <AudioPlayer src={story.audio} title="Слушать легенду" duration={story.audioDuration} />

        <p className="body">{story.text}</p>

        {multi && !allViewed && (
          <div className="note">
            Вторая история — в сквере в 100 м. Переключите вкладку, когда дойдёте: у неё своя аудиолегенда.
          </div>
        )}

        {multi && allViewed && !isDone && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => taskRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            К заданию ↓
          </button>
        )}

        <div className="task" ref={taskRef}>
          <div className="eyebrow">Задание</div>
          {isDone ? (
            <>
              <p className="task__q">Задание выполнено ✓</p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate(isLast ? "/finish" : "/walk")}
              >
                {isLast ? "К итогу" : "К следующей точке"}
              </button>
            </>
          ) : !allViewed ? (
            <p className="muted">Откройте обе вкладки, чтобы перейти к заданию.</p>
          ) : (
            <form onSubmit={check} className="stack">
              <label htmlFor="answer" className="task__q">
                {stop.task.question}
              </label>
              <input
                id="answer"
                className={`input ${wrong ? "input--error" : ""}`}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setWrong(false);
                }}
                placeholder="Ваш ответ"
                autoComplete="off"
                enterKeyHint="done"
              />
              {wrong && <div className="error">Не совсем. Попробуйте ещё раз.</div>}
              {(hintOpen || attempts > 0) && <div className="note">{stop.task.hint}</div>}
              <button type="submit" className="btn btn--primary" disabled={!answer.trim()}>
                Проверить
              </button>
              {attempts === 0 && !hintOpen && (
                <button type="button" className="link" onClick={() => setHintOpen(true)}>
                  Подсказка
                </button>
              )}
              {attempts >= MAX_ATTEMPTS && (
                <div className="reveal">
                  <div className="muted small">Правильный ответ: {stop.task.answers[0]}</div>
                  <button type="button" className="btn btn--secondary" onClick={complete}>
                    Идти дальше
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        <a className="source" href={stop.source.url} target="_blank" rel="noopener noreferrer">
          Источник: {stop.source.label} ↗
        </a>
      </div>
    </div>
  );
}
