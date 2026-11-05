import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { STOPS } from "../data/stops";

export type Progress = {
  startedAt: number | null;
  finishedAt: number | null;
  /** Индекс остановки, к которой идёт участник (0…STOPS.length) */
  current: number;
  /** id пройденных остановок */
  done: number[];
  /** Неверные попытки по id остановки */
  attempts: Record<number, number>;
  /** Открытые вкладки историй по id остановки */
  viewedTabs: Record<number, string[]>;
  /** Имя, записанное с плиты в финале */
  name: string;
};

type Action =
  | { type: "start" }
  | { type: "reset" }
  | { type: "viewTab"; stopId: number; storyId: string }
  | { type: "wrong"; stopId: number }
  | { type: "complete"; stopId: number }
  | { type: "setName"; name: string };

export const PROGRESS_KEY = "ulitsy-progress-v1";

const initial: Progress = {
  startedAt: null,
  finishedAt: null,
  current: 0,
  done: [],
  attempts: {},
  viewedTabs: {},
  name: "",
};

function load(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

function reducer(state: Progress, action: Action): Progress {
  switch (action.type) {
    case "start":
      return { ...initial, startedAt: Date.now() };
    case "reset":
      return initial;
    case "viewTab": {
      const seen = state.viewedTabs[action.stopId] ?? [];
      if (seen.includes(action.storyId)) return state;
      return { ...state, viewedTabs: { ...state.viewedTabs, [action.stopId]: [...seen, action.storyId] } };
    }
    case "wrong":
      return {
        ...state,
        attempts: { ...state.attempts, [action.stopId]: (state.attempts[action.stopId] ?? 0) + 1 },
      };
    case "complete": {
      if (state.done.includes(action.stopId)) return state;
      const done = [...state.done, action.stopId];
      const index = STOPS.findIndex((s) => s.id === action.stopId);
      const current = Math.max(state.current, index + 1);
      const finished = current >= STOPS.length;
      return { ...state, done, current, finishedAt: finished ? Date.now() : state.finishedAt };
    }
    case "setName":
      return { ...state, name: action.name };
  }
}

const Ctx = createContext<{ progress: Progress; dispatch: (a: Action) => void } | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      /* приватный режим браузера — прогресс просто не сохранится */
    }
  }, [progress]);
  return <Ctx.Provider value={{ progress, dispatch }}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgress вне ProgressProvider");
  return ctx;
}
