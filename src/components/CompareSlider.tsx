import { useState } from "react";
import knob from "../assets/slider-knob.svg";

type Props = { then: string; now: string; alt: string; year: string };

/** Шторка «Было / Стало». Пустой путь или файл, который не загрузился, — заглушка со штриховкой */
export function CompareSlider({ then, now, alt, year }: Props) {
  const [pos, setPos] = useState(50);
  return (
    <div className="compare">
      <Picture key={then} src={then} alt={`${alt}: архивное фото`} caption="Архивное фото" side="then" />
      <div className="compare__now" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <Picture key={now} src={now} alt={`${alt}: сейчас`} caption="Фото сейчас" side="now" />
      </div>
      <div className="compare__divider" style={{ left: `${pos}%` }} aria-hidden>
        <div className="compare__handle">
          <img src={knob} width={46} height={46} alt="" />
          <span>⇆</span>
        </div>
      </div>
      <span className="compare__tag compare__tag--left">Было{year ? ` · ${year}` : ""}</span>
      <span className="compare__tag compare__tag--right">Стало · 2026</span>
      <input
        className="compare__range"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Сравнить было и стало"
      />
    </div>
  );
}

function Picture({ src, alt, caption, side }: { src: string; alt: string; caption: string; side: "then" | "now" }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className={`picture picture--${side}`} role="img" aria-label={`${caption}: будет добавлено`}>
        <span className="picture__caption">
          {caption}
          <br />
          заглушка
        </span>
      </div>
    );
  }
  return <img className="picture" src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />;
}
