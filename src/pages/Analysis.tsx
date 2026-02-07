import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Chess } from "chess.js";
import { SimpleBoard } from "../components/SimpleBoard";
import { MoveList } from "../components/MoveList";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const Analysis = () => {
  const { gameId } = useParams(); // URL에서 ID 추출
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [boardPosition, setBoardPosition] = useState("start");

  useEffect(() => {
    // 1. 게임 데이터 불러오기 로직
    axios.get(`${API_BASE_URL}/games/list`).then((res) => {
      const game = res.data.find((g: any) => g._id === gameId);
      if (game) {
        const chess = new Chess();
        chess.loadPgn(game.pgn);
        const moves = chess.history({ verbose: true });
        setHistory(moves);
        setCurrentMoveIndex(moves.length - 1);
        setBoardPosition(chess.fen());
      }
    });
  }, [gameId]);

  // 수 선택 로직 (기존과 동일)
  const handleMoveSelection = (index: number) => {
    const tempChess = new Chess();
    for (let i = 0; i <= index; i++) {
      tempChess.move(history[i].san);
    }
    setCurrentMoveIndex(index);
    setBoardPosition(tempChess.fen());
  };

  // 키보드 이벤트 로직
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && currentMoveIndex < history.length - 1) {
        handleMoveSelection(currentMoveIndex + 1);
      } else if (e.key === "ArrowLeft" && currentMoveIndex >= 0) {
        handleMoveSelection(currentMoveIndex - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentMoveIndex, history]);

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: "20px", padding: "8px 16px", cursor: "pointer" }}>
        ← 로비로 돌아가기
      </button>

      <main style={{ display: "flex", flexWrap: "wrap", gap: "30px", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 300px", maxWidth: "600px" }}>
          <SimpleBoard position={boardPosition} />
        </div>
        <div style={{ flex: "1 1 300px", maxWidth: "400px" }}>
          <MoveList history={history} currentMoveIndex={currentMoveIndex} onMoveClick={handleMoveSelection} />
        </div>
      </main>
    </div>
  );
};
