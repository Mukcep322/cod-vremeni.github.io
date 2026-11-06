import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { STOPS } from "../data/stops";
import arrowInk from "../assets/icon-arrow-ink.svg";
import arrowPaper from "../assets/icon-arrow-paper.svg";
import headerMark from "../assets/header-mark.svg";

/** Chip / Era */
export function Chip({ children, mineral }: { children: ReactNode; mineral?: boolean }) {
  return <span className={`chip ${mineral ? "chip--mineral" : ""}`}>{children}</span>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "dark" | "accent";
  /** Внешняя ссылка: кнопка становится тегом <a> */
  href?: string;
  /** Стрелка вниз вместо стрелки вправо */
  down?: boolean;
};

/** Брутальная кнопка: подпись слева, стрелка у правого края */
export function Button({ variant = "primary", href, down, children, type = "button", ...rest }: ButtonProps) {
  const className = `btn btn--${variant}`;
  const arrow = variant === "primary" || variant === "dark" ? arrowPaper : arrowInk;
  const body = (
    <>
      <span className="btn__label">{children}</span>
      <img className={`btn__icon ${down ? "btn__icon--down" : ""}`} src={arrow} width={24} height={24} alt="" />
    </>
  );
  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    );
  }
  return (
    <button type={type} className={className} {...rest}>
      {body}
    </button>
  );
}

/** Полоска прогресса из сегментов по числу остановок */
export function Segments({ done, current }: { done: number; current?: number }) {
  return (
    <div className="segments" role="img" aria-label={`Пройдено ${done} из ${STOPS.length}`}>
      {STOPS.map((s, i) => (
        <span
          key={s.id}
          className={`segments__item ${i < done ? "is-done" : ""} ${i === current ? "is-current" : ""}`}
        />
      ))}
    </div>
  );
}

/** Шапка: вариант «Карта» со знаком или «Назад» со ссылкой на карту */
export function Header({ number, back }: { number: number; back?: boolean }) {
  return (
    <header className="header">
      <div className="header__side">
        {back ? (
          <Link to="/walk" className="header__back">
            ← Карта
          </Link>
        ) : (
          <img src={headerMark} width={26} height={26} alt="" />
        )}
      </div>
      <span className="header__title">Маршрут Победы</span>
      <div className="header__side header__side--right">
        <span className="header__counter">
          {Math.min(number, STOPS.length)} / {STOPS.length}
        </span>
      </div>
    </header>
  );
}
