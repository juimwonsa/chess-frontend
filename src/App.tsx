import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Lobby } from "./pages/Lobby";
import { Analysis } from "./pages/Analysis";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로비 페이지: 전체 게임 리스트 */}
        <Route path="/" element={<Lobby />} />
        {/* 분석 페이지: 게임 ID를 URL 파라미터로 받음 */}
        <Route path="/analysis/:gameId" element={<Analysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
