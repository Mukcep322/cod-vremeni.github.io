import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProgressProvider } from "./state/progress";
import { Start } from "./screens/Start";
import { Walk } from "./screens/Walk";
import { Stop } from "./screens/Stop";
import { Done } from "./screens/Done";
import { Finish } from "./screens/Finish";

// HashRouter: адреса вида #/stop/2 работают на GitHub Pages без настройки сервера
export default function App() {
  return (
    <ProgressProvider>
      <HashRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/walk" element={<Walk />} />
            <Route path="/stop/:id" element={<Stop />} />
            <Route path="/stop/:id/done" element={<Done />} />
            <Route path="/finish" element={<Finish />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </HashRouter>
    </ProgressProvider>
  );
}
