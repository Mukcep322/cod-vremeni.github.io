import type { MarkerState } from "../lib/markers";
import pinActive from "../assets/pin-active.svg";
import pinDefault from "../assets/pin-default.svg";
import pinFound from "../assets/pin-found.svg";
import meIcon from "../assets/map-me.svg";

const PINS: Record<MarkerState, { src: string; label: string }> = {
  done: { src: pinFound, label: "пройдена" },
  target: { src: pinActive, label: "текущая цель" },
  next: { src: pinDefault, label: "впереди" },
};

/** Пин-лист с номером. Острие стоит в точке (0, 0) родителя */
export function Pin({ number, state }: { number: number; state: MarkerState }) {
  const { src, label } = PINS[state];
  return (
    <div className="pin" role="img" aria-label={`Остановка ${number}, ${label}`}>
      <img src={src} width={52} height={67} alt="" />
      <span className="pin__tag">{number}</span>
    </div>
  );
}

/** Метка «Вы здесь». Центр стоит в точке (0, 0) родителя */
export function MeMarker() {
  return (
    <div className="me" role="img" aria-label="Вы здесь">
      <img src={meIcon} width={44} height={44} alt="" />
      <span className="me__tag">ВЫ ЗДЕСЬ</span>
    </div>
  );
}
