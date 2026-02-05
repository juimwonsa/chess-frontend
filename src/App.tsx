import { useEffect, useState } from "react";
import axios from "axios";
import type { Game, AnalysisMove } from "./types/chess";
import { AnalysisBoard } from "./components/AnalysisBoard";
import { EvaluationChart } from "./components/EvaluationChart";
import { GameList } from "./components/GameList";

const SERVER_IP = "168.107.23.245";

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisMove[]>([]);
  const [boardPosition, setBoardPosition] = useState<string>("start");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`http://${SERVER_IP}:8000/games/list`).then((res) => setGames(res.data));
  }, []);

  const handleAnalyze = async (gameId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://${SERVER_IP}:8000/analyze/full/${gameId}`);
      setAnalysis(res.data.details);
      setSelectedGame(games.find((g) => g._id === gameId) || null);
    } finally {
      setLoading(false);
    }
  };
  // App.tsx의 return 부분 확인
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <GameList games={games} onSelectGame={handleAnalyze} selectedGameId={selectedGame?._id} />

      <main style={{ flex: 1, padding: "20px" }}>
        {loading ? (
          <h2>분석 중입니다...</h2>
        ) : selectedGame ? (
          <div style={{ display: "flex", gap: "20px" }}>
            {/* 컴포넌트가 정상적으로 로드되었는지 여기서 확인 가능 */}
            <AnalysisBoard position={boardPosition} />
            <EvaluationChart analysis={analysis} onHoverMove={setBoardPosition} />
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>분석할 게임을 왼쪽 목록에서 선택해 주세요!</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
