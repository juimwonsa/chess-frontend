import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [games, setGames] = useState([]);
  const SERVER_IP = "168.107.23.245";

  useEffect(() => {
    // 서버에서 게임 목록 가져오기
    axios
      .get(`http://${SERVER_IP}:8000/games/list`)
      .then((res) => setGames(res.data))
      .catch((err) => console.error("연결 실패:", err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>♟️ kdwing's Chess Analysis</h1>
      <hr />
      <div style={{ display: "grid", gap: "10px" }}>
        {games.map((game: any) => (
          <div
            key={game._id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <strong>
              {game.white.username} vs {game.black.username}
            </strong>
            <p>
              결과: {game.white.result} - {game.black.result}
            </p>
            <button onClick={() => alert(`${game._id} 분석 시작!`)}>
              게임 분석하기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
