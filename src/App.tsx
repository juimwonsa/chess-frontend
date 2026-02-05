import { useEffect, useState } from "react";
import axios from "axios";
import type { Game, AnalysisMove } from "./types/chess";
import { GameList } from "./components/GameList";
import { AnalysisBoard } from "./components/AnalysisBoard";
import { EvaluationChart } from "./components/EvaluationChart"; // 차트도 별도 컴포넌트로 분리했다고 가정

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

  const handleSelectGame = async (gameId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://${SERVER_IP}:8000/analyze/full/${gameId}`);
      setAnalysis(res.data.details);
      setSelectedGame(games.find((g) => g._id === gameId) || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f8f9fa" }}>
      <GameList games={games} selectedGameId={selectedGame?._id} onSelectGame={handleSelectGame} />

      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {loading ? (
          <div>분석 중... ⚙️</div>
        ) : selectedGame ? (
          <div style={{ display: "flex", gap: "40px" }}>
            <AnalysisBoard position={boardPosition} />
            <EvaluationChart analysis={analysis} onHoverMove={(pos) => setBoardPosition(pos)} />
          </div>
        ) : (
          <div>게임을 선택해 주세요.</div>
        )}
      </main>
    </div>
  );
}

export default App;
