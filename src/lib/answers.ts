import type { Task } from "../data/stops";

/** Нормализация ответа: регистр, ё/е, пробелы и знаки препинания */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[\s.,!?;:«»"'()№–—-]+/g, "");
}

/** Первое число из ответа участника: «примерно 85 шагов» → 85 */
function firstNumber(s: string): number | null {
  const found = s.match(/\d+(?:[.,]\d+)?/);
  return found ? Number(found[0].replace(",", ".")) : null;
}

/** Ответ для показа на экране: с допуском — «80 ± 10», иначе первый правильный ответ */
export function displayAnswer({ answers, tolerance }: Task): string {
  return tolerance === undefined ? answers[0] : `${answers[0]} ± ${tolerance}`;
}

/** Проверка ответа: числовой допуск, точное совпадение или обязательные фрагменты */
export function isCorrectAnswer({ answers, mustContain, tolerance }: Task, raw: string): boolean {
  if (tolerance !== undefined) {
    const value = firstNumber(raw);
    return value !== null && Math.abs(value - Number(answers[0])) <= tolerance;
  }
  const given = normalizeAnswer(raw);
  return (
    answers.some((a) => normalizeAnswer(a) === given) ||
    (!!mustContain?.length && mustContain.every((part) => given.includes(normalizeAnswer(part))))
  );
}
