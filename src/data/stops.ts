export type Story = {
  id: string;
  /** Подпись вкладки, если на остановке несколько историй */
  tab?: string;
  title: string;
  address: string;
  period: string;
  /** Координаты места [широта, долгота] */
  coords: [number, number];
  then: string;
  now: string;
  audio: string;
  /** Длительность аудио для подписи, например "1:20". Пусто — не показывать */
  audioDuration: string;
  text: string;
};

export type Task = {
  question: string;
  /** Правильные ответы. Сравнение без учёта регистра, пробелов и «ё/е» */
  answers: string[];
  hint: string;
  /** Текст на экране «Ответ принят» */
  reward: string;
};

export type Stop = {
  id: number;
  /** Название остановки в шторке «Следующая остановка» */
  title: string;
  /** Короткое имя для подписи на схеме */
  short: string;
  stories: Story[];
  task: Task;
  source: { label: string; url: string };
};

const FISH =
  "Значимость этих проблем настолько очевидна, что дальнейшее развитие различных форм деятельности требует определения и уточнения позиций, занимаемых участниками в отношении поставленных задач. Равным образом новая модель организационной деятельности играет важную роль в формировании системы обучения кадров.";
const FISH_SHORT =
  "Идейные соображения высшего порядка, а также постоянный количественный рост и сфера нашей активности позволяют оценить значение новых предложений.";
const QUESTION = "Текст задания (рыба): что нужно найти или посчитать на этом месте?";
// Временный ответ для всех заданий, пока нет настоящих. Замените в каждом задании.
const ANSWER = ["ответ"];

export const STOPS: Stop[] = [
  {
    id: 1,
    title: "Школа № 2",
    short: "Школа № 2",
    stories: [
      {
        id: "1",
        title: "Школа № 2",
        address: "ул. Первомайская, 58",
        period: "1941–1943",
        coords: [52.603234, 39.583798],
        then: "",
        now: "",
        audio: "",
        audioDuration: "",
        text: FISH,
      },
    ],
    task: { question: QUESTION, answers: ANSWER, hint: "Подсказка (рыба).", reward: FISH_SHORT },
    source: { label: "ЛОУНБ «Память Вечного огня»: госпитали Липецка", url: "https://war.lib48.ru/gospitali/lipetsk" },
  },
  {
    id: 2,
    title: "Здание на ул. Советской",
    short: "ул. Советская, 4",
    stories: [
      {
        id: "2",
        title: "Здание на ул. Советской",
        address: "ул. Советская, 4",
        period: "декабрь 1942",
        coords: [52.604868, 39.594547],
        then: "",
        now: "",
        audio: "",
        audioDuration: "",
        text: FISH,
      },
    ],
    task: { question: QUESTION, answers: ANSWER, hint: "Подсказка (рыба).", reward: FISH_SHORT },
    source: {
      label: "ЛОУНБ: доска 491-го миномётного полка",
      url: "https://war.lib48.ru/memorialnye-doski/lipetsk/memorialnaya-doska-v-chest-formirovaniya-v-1942-godu-491-go-minometnogo-polka",
    },
  },
  {
    id: 3,
    title: "Площадь Революции",
    short: "пл. Революции",
    stories: [
      {
        id: "3a",
        tab: "1941 · Полки",
        title: "Площадь Революции, 10а",
        address: "пл. Революции, 10а",
        period: "30 июня 1941",
        coords: [52.604386, 39.596416],
        then: "",
        now: "",
        audio: "",
        audioDuration: "",
        text: FISH,
      },
      {
        id: "3b",
        tab: "1943 · Экипаж Барашева",
        title: "Могила экипажа Барашева",
        address: "сквер на пл. Революции",
        period: "август 1943",
        coords: [52.6036011, 39.5969923],
        then: "",
        now: "",
        audio: "",
        audioDuration: "",
        text: FISH,
      },
    ],
    task: { question: QUESTION, answers: ANSWER, hint: "Подсказка (рыба).", reward: FISH_SHORT },
    source: {
      label: "ЛОУНБ: доска 653-го и 660-го полков",
      url: "https://war.lib48.ru/memorialnye-doski/lipetsk/memorialnaya-doska-v-chest-formirovaniya-v-1941-godu-653-go-strelkovogo-minskogo-krasnoznamennogo-polka-i-660-go-artillerijskogo-nemanskogo-polka",
    },
  },
  {
    id: 4,
    title: "Липецкий курорт",
    short: "Курорт",
    stories: [
      {
        id: "4",
        title: "Липецкий курорт",
        address: "ул. Салтыкова-Щедрина, 1",
        period: "1942",
        coords: [52.6079106, 39.6009848],
        then: "",
        now: "",
        audio: "",
        audioDuration: "",
        text: FISH,
      },
    ],
    task: { question: QUESTION, answers: ANSWER, hint: "Подсказка (рыба).", reward: FISH_SHORT },
    source: { label: "ЛОУНБ «Память Вечного огня»: госпитали Липецка", url: "https://war.lib48.ru/gospitali/lipetsk" },
  },
  {
    id: 5,
    title: "Площадь Героев",
    short: "Площадь Героев",
    stories: [
      {
        id: "5",
        title: "Площадь Героев",
        address: "Вечный огонь",
        period: "1985",
        coords: [52.617782, 39.5973757],
        then: "",
        now: "",
        audio: "",
        audioDuration: "",
        text: FISH,
      },
    ],
    task: { question: QUESTION, answers: ANSWER, hint: "Подсказка (рыба).", reward: FISH_SHORT },
    source: {
      label: "ЛОУНБ: братские могилы у Вечного огня",
      url: "https://war.lib48.ru/voinskie-zakhoroneniya/lipetsk/bratskie-mogily-u-vechnogo-ognya-na-ploshchadi-geroev",
    },
  },
];

export const INTRO = FISH_SHORT;
export const FINAL_FACT = FISH_SHORT;

/** Точка остановки на карте: среднее координат её историй */
export function stopCoords(stop: Stop): [number, number] {
  const n = stop.stories.length;
  const lat = stop.stories.reduce((s, x) => s + x.coords[0], 0) / n;
  const lon = stop.stories.reduce((s, x) => s + x.coords[1], 0) / n;
  return [lat, lon];
}
