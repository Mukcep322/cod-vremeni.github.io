import { useState, type FormEvent } from "react";
import type { Task } from "../data/stops";
import { displayAnswer, isCorrectAnswer } from "../lib/answers";
import { Button } from "./ui";

const MAX_ATTEMPTS = 3;

type Props = {
  task: Task;
  /** Неверные попытки на этой остановке */
  attempts: number;
  onCorrect: () => void;
  onWrong: () => void;
};

/** Вопрос, поле ответа и подсказка. После MAX_ATTEMPTS ошибок показывает правильный ответ */
export function TaskForm({ task, attempts, onCorrect, onWrong }: Props) {
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  if (attempts >= MAX_ATTEMPTS) {
    return (
      <>
        <p className="task__q">{task.question}</p>
        <div className="answer-box">
          <div className="label-xs">Правильный ответ · после {MAX_ATTEMPTS} попыток</div>
          <div className="answer-box__text">{displayAnswer(task)}</div>
        </div>
        <Button variant="secondary" onClick={onCorrect}>
          Идти дальше
        </Button>
      </>
    );
  }

  const check = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    if (isCorrectAnswer(task, answer)) {
      onCorrect();
    } else {
      onWrong();
      setWrong(true);
    }
  };

  return (
    <form onSubmit={check} className="stack">
      <label htmlFor="answer" className="task__q">
        {task.question}
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
        inputMode={task.numeric ? "numeric" : undefined}
        enterKeyHint="done"
      />
      {wrong && <div className="error">Не совсем. Попробуйте ещё раз.</div>}
      {(hintOpen || attempts > 0) && (
        <div className="hint-box">
          <div className="label-xs">Подсказка</div>
          <div className="text-small">{task.hint}</div>
          {/* Ответ в подсказке оставлен намеренно: жюри не должно искать его на месте */}
          <div className="text-small">Ответ: {displayAnswer(task)}</div>
        </div>
      )}
      <Button type="submit" disabled={!answer.trim()}>
        Проверить
      </Button>
      {attempts === 0 && !hintOpen && (
        <button type="button" className="link" onClick={() => setHintOpen(true)}>
          Подсказка
        </button>
      )}
    </form>
  );
}
