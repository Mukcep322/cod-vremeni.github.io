import { useEffect, useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { dataClass, isNoData, STOPS } from "../data/stops";
import { normalizeAnswer } from "../lib/geo";
import { useProgress } from "../state/progress";
import { CompareSlider } from "../components/CompareSlider";
import { AudioPlayer } from "../components/AudioPlayer";
import { Button, Chip, Header } from "../components/ui";
import iconArchive from "../assets/icon-archive.svg";
import iconCompass from "../assets/icon-compass.svg";
import iconKeyhole from "../assets/icon-keyhole.svg";
import iconPin from "../assets/icon-pin.svg";
import iconQuestion from "../assets/icon-question.svg";

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
  const closed = !isDone && !allViewed;
  const unseen = stop.stories.find((s) => !viewed.includes(s.id));

  const complete = () => {
    dispatch({ type: "complete", stopId: stop.id });
    navigate(`/stop/${stop.id}/done`);
  };

  const check = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    const { answers, mustContain, tolerance } = stop.task;
    const given = normalizeAnswer(answer);
    let ok: boolean;
    if (tolerance !== undefined) {
      const found = answer.match(/\d+(?:[.,]\d+)?/);
      ok = !!found && Math.abs(Number(found[0].replace(",", ".")) - Number(answers[0])) <= tolerance;
    } else {
      ok =
        answers.some((a) => normalizeAnswer(a) === given) ||
        (!!mustContain?.length && mustContain.every((part) => given.includes(normalizeAnswer(part))));
    }
    if (ok) {
      complete();
    } else {
      dispatch({ type: "wrong", stopId: stop.id });
      setWrong(true);
    }
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

        {isNoData(story.legend) ? (
          <p className="missing">{story.legend}</p>
        ) : (
          story.legend && (
            <details className="legend">
              <summary>
                ТЕКСТ АУДИОЛЕГЕНДЫ
                <span className="legend__sign" aria-hidden />
              </summary>
              <p className="text-small">{story.legend}</p>
            </details>
          )
        )}

        <p className={dataClass(story.text, "body")}>{story.text}</p>

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
          ) : attempts >= MAX_ATTEMPTS ? (
            <>
              <p className={dataClass(stop.task.question, "task__q")}>{stop.task.question}</p>
              <div className="answer-box">
                <div className="label-xs">Правильный ответ · после {MAX_ATTEMPTS} попыток</div>
                <div className="answer-box__text">{stop.task.answers[0]}</div>
              </div>
              <Button variant="secondary" onClick={complete}>
                Идти дальше
              </Button>
            </>
          ) : (
            <form onSubmit={check} className="stack">
              <label htmlFor="answer" className={dataClass(stop.task.question, "task__q")}>
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
                inputMode={stop.task.numeric ? "numeric" : undefined}
                enterKeyHint="done"
              />
              {wrong && <div className="error">Не совсем. Попробуйте ещё раз.</div>}
              {(hintOpen || attempts > 0) &&
                (isNoData(stop.task.hint) ? (
                  <div className="missing">{stop.task.hint}</div>
                ) : (
                  <div className="hint-box">
                    <div className="label-xs">Подсказка</div>
                    <div className="text-small">{stop.task.hint}</div>
                  </div>
                ))}
              <Button type="submit" disabled={!answer.trim()}>
                Проверить
              </Button>
              {attempts === 0 && !hintOpen && (
                <button type="button" className="link" onClick={() => setHintOpen(true)}>
                  Подсказка
                </button>
              )}
            </form>
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
