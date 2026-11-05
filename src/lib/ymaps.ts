import React from "react";
import ReactDOM from "react-dom";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Компоненты JS API 3.0 приходят из скрипта Яндекса во время работы,
// поэтому здесь они типизированы как any. Для строгих типов можно
// поставить пакет @yandex/ymaps3-types (см. README).
export type YMapsKit = {
  reactify: any;
  YMap: any;
  YMapDefaultSchemeLayer: any;
  YMapDefaultFeaturesLayer: any;
  YMapMarker: any;
  YMapFeature: any;
};

let promise: Promise<YMapsKit | null> | null = null;

export const YMAPS_KEY: string = (import.meta.env.VITE_YMAPS_API_KEY ?? "").trim();

/** Загружает JS API 3.0 и обёртку для React. Без ключа возвращает null. */
export function loadYMaps(): Promise<YMapsKit | null> {
  if (!YMAPS_KEY) return Promise.resolve(null);
  if (promise) return promise;
  promise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(YMAPS_KEY)}&lang=ru_RU`;
    script.async = true;
    script.onload = async () => {
      try {
        const ymaps3 = (window as any).ymaps3;
        await ymaps3.ready;
        const reactifyModule = await ymaps3.import("@yandex/ymaps3-reactify");
        const reactify = reactifyModule.reactify.bindTo(React, ReactDOM);
        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapFeature } =
          reactify.module(ymaps3);
        resolve({ reactify, YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapFeature });
      } catch (e) {
        console.error("Яндекс Карты не загрузились", e);
        resolve(null);
      }
    };
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return promise;
}
