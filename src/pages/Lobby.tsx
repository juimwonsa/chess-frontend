import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { Game } from "../types/chess";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Lobby = () => {
  const [games, setGames] = useState<Game[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 환경 변수를 사용하여 요청
    axios
      .get(`${API_BASE_URL}/games/list`)
      .then((res) => setGames(res.data))
      .catch((err) => console.error("데이터 로드 실패:", err));
  }, []);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>♟️ My Chess Games</h1>
      <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
        {games.map((game) => (
          <div
            key={game._id}
            onClick={() => navigate(`/analysis/${game._id}`)}
            style={{
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              {game.white.username} vs {game.black.username}
            </div>
            <div style={{ color: "#868e96", fontSize: "0.9rem" }}>{new Date(game.end_time * 1000).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
