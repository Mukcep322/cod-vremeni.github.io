import { useEffect, useRef, useState } from "react";

type Props = { src: string; title: string; duration: string };

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

/** Плеер аудиолегенды. Пустой src — заглушка «аудио появится позже». */
export function AudioPlayer({ src, title, duration }: Props) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // при смене вкладки останавливаем прежнюю дорожку
    setPlaying(false);
    setTime(0);
    setTotal(0);
  }, [src]);

  const disabled = !src;

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const label = disabled ? "Аудио появится позже" : `${title}${duration ? ` · ${duration}` : ""}`;

  return (
    <div className={`audio ${disabled ? "audio--disabled" : ""}`}>
      <button
        type="button"
        className="audio__btn"
        onClick={toggle}
        disabled={disabled}
        aria-label={playing ? "Пауза" : "Слушать легенду"}
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <rect x="3" y="2" width="3.5" height="12" rx="1" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <path d="M4 2.5 13.5 8 4 13.5Z" />
          </svg>
        )}
      </button>
      <div className="audio__body">
        <div className="audio__title">{label}</div>
        <input
          type="range"
          className="audio__bar"
          min={0}
          max={total || 1}
          step={0.1}
          value={time}
          disabled={disabled || !total}
          onChange={(e) => {
            const a = ref.current;
            if (a) a.currentTime = Number(e.target.value);
          }}
          aria-label="Перемотка"
        />
        {!disabled && total > 0 && (
          <div className="audio__time">
            {fmt(time)} / {fmt(total)}
          </div>
        )}
      </div>
      {src && (
        <audio
          ref={ref}
          src={src}
          preload="metadata"
          onLoadedMetadata={(e) => setTotal(e.currentTarget.duration)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onEnded={() => setPlaying(false)}
        />
      )}
    </div>
  );
}
