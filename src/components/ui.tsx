import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { STOPS } from "../data/stops";

export function Chip({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <span className={`chip ${dark ? "chip--dark" : ""}`}>{children}</span>;
}

/** Полоска прогресса из сегментов по числу остановок */
export function Segments({ done, current }: { done: number; current?: number }) {
  return (
    <div className="segments" aria-label={`Пройдено ${done} из ${STOPS.length}`}>
      {STOPS.map((s, i) => (
        <span
          key={s.id}
          className={`segments__item ${i < done ? "is-done" : ""} ${i === current ? "is-current" : ""}`}
        />
      ))}
    </div>
  );
}

export function StatusSpacer() {
  return <div className="status-spacer" aria-hidden />;
}

export function TopBar({ right }: { right?: ReactNode }) {
  return (
    <header className="topbar">
      <Link to="/walk" className="topbar__back">
        ← Карта
      </Link>
      <span className="topbar__right">{right}</span>
    </header>
  );
}
