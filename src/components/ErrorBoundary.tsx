import { Component, type ErrorInfo, type ReactNode } from "react";
import { PROGRESS_KEY } from "../state/progress";

type Props = { fallback: ReactNode | ((error: Error) => ReactNode); children: ReactNode };

/** Ловит ошибки рендера, чтобы сбой одного блока не оставлял белый экран */
export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Сбой интерфейса", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const { fallback } = this.props;
    return typeof fallback === "function" ? fallback(error) : fallback;
  }
}

function resetProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    /* хранилище недоступно — сбрасывать нечего */
  }
  window.location.hash = "";
  window.location.reload();
}

/** Экран сбоя всего приложения. Не зависит от роутера и прогресса: они могли сломаться первыми */
export function CrashScreen({ error }: { error: Error }) {
  return (
    <div className="app">
      <div className="screen screen--page">
        <div className="page page--fill">
          <h1 className="title-l">Что-то пошло не так</h1>
          <p className="body">Обновите страницу. Если ошибка повторится, сбросьте прогресс и начните маршрут заново.</p>
          <p className="muted small">{error.message}</p>
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
          <button type="button" className="btn btn--secondary" onClick={resetProgress}>
            Сбросить прогресс
          </button>
        </div>
      </div>
    </div>
  );
}
