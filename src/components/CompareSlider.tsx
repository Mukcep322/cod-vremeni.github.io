import { useState } from "react";

type Props = { then: string; now: string; alt: string };

/** Шторка «тогда / сейчас». Пустой путь — серая заглушка. */
export function CompareSlider({ then, now, alt }: Props) {
  const [pos, setPos] = useState(50);
  return (
    <div className="compare">
      <Picture src={then} alt={`${alt}: архивное фото`} label="Тогда" side="then" />
      <div className="compare__now" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <Picture src={now} alt={`${alt}: сейчас`} label="Сейчас" side="now" />
      </div>
      <div className="compare__divider" style={{ left: `${pos}%` }} aria-hidden>
        <span className="compare__handle">‹ ›</span>
      </div>
      <span className="compare__tag compare__tag--left">Тогда</span>
      <span className="compare__tag compare__tag--right">Сейчас</span>
      <input
        className="compare__range"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Сравнить тогда и сейчас"
      />
    </div>
  );
}

function Picture({ src, alt, label, side }: { src: string; alt: string; label: string; side: "then" | "now" }) {
  if (!src) {
    return (
      <div className={`picture picture--empty picture--${side}`} role="img" aria-label={`${label}: фото будет добавлено`}>
        <span>Фото «{label.toLowerCase()}»</span>
      </div>
    );
  }
  return <img className="picture" src={src} alt={alt} loading="lazy" />;
}
