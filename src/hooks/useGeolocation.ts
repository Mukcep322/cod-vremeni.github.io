import { useEffect, useState } from "react";

export type Position = { lat: number; lon: number; accuracy: number };

/** Следит за положением участника. Работает только по HTTPS (или на localhost). */
export function useGeolocation(enabled: boolean) {
  const [pos, setPos] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!("geolocation" in navigator)) {
      setError("Браузер не поддерживает геолокацию");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setError(null);
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy });
      },
      (e) => setError(e.code === e.PERMISSION_DENIED ? "Доступ к геолокации запрещён" : "Не удаётся определить место"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);

  return { pos, error };
}
