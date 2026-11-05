import { useEffect, useRef, useState } from "react";
import playIcon from "../assets/audio-play.svg";
import emptyIcon from "../assets/audio-empty.svg";

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
          <span className="audio__pause" aria-hidden>
            <i />
            <i />
          </span>
        ) : (
          <img src={disabled ? emptyIcon : playIcon} width={48} height={48} alt="" />
        )}
      </button>
      <div className="audio__body">
        <div className="audio__title">{label}</div>
        <div className="audio__track">
          <span className="audio__fill" style={{ width: total ? `${(time / total) * 100}%` : 0 }} />
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
        </div>
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
