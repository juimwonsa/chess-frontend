import { useEffect, useState } from "react";
import axios from "axios";
import { Chessboard } from "react-chessboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// --- 1. TypeScript 타입 정의 (Interface) ---
interface Player {
  username: string;
  result: string;
}

interface Game {
  _id: string;
  white: Player;
  black: Player;
  end_time: number;
  pgn: string;
}

interface AnalysisMove {
  move_number: number;
  turn: string;
  move: string;
  eval: number;
  diff: number;
  is_blunder: boolean;
}

// Recharts의 점(Dot)이 전달해주는 데이터의 형식을 정의합니다.
interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: AnalysisMove; // 우리가 정의한 그 분석 데이터입니다!
}

const SERVER_IP = "168.107.23.245";

function App() {
  // --- 2. 상태 관리 (State) ---
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisMove[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // --- 3. 데이터 패칭 (useEffect) ---
  useEffect(() => {
    axios
      .get(`http://${SERVER_IP}:8000/games/list`)
      .then((res) => setGames(res.data))
      .catch((err) => console.error("게임 목록 로드 실패:", err));
  }, []);

  // --- 4. 게임 분석 핸들러 ---
  const handleAnalyze = async (gameId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://${SERVER_IP}:8000/analyze/full/${gameId}`,
      );
      setAnalysis(res.data.details);
      const targetGame = games.find((g) => g._id === gameId);
      if (targetGame) setSelectedGame(targetGame);
    } catch (err) {
      console.error("분석 에러:", err);
      alert("분석 데이터를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f8f9fa" }}
    >
      {/* [SIDEBAR] 게임 목록 */}
      <div
        style={{
          width: "350px",
          borderRight: "1px solid #dee2e6",
          padding: "20px",
          overflowY: "auto",
          backgroundColor: "white",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>♟️ kdwing's Analysis</h2>
        {games.length === 0 && (
          <p style={{ color: "#888" }}>
            서버에서 데이터를 불러오고 있습니다...
          </p>
        )}
        {games.map((game) => (
          <div
            key={game._id}
            onClick={() => handleAnalyze(game._id)}
            style={{
              padding: "15px",
              borderBottom: "1px solid #f1f3f5",
              cursor: "pointer",
              backgroundColor:
                selectedGame?._id === game._id ? "#e7f5ff" : "transparent",
              borderRadius: "10px",
              transition: "0.2s",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {game.white.username} <span style={{ color: "#adb5bd" }}>vs</span>{" "}
              {game.black.username}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#868e96",
                marginTop: "5px",
              }}
            >
              {new Date(game.end_time * 1000).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* [MAIN] 분석 결과 화면 */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>Stockfish 분석 중... ⚙️</h2>
            <p>게임 길이에 따라 최대 30초 정도 소요될 수 있습니다.</p>
          </div>
        ) : selectedGame ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
              {/* 체스판 섹션 */}
              <div style={{ width: "450px" }}>
                <div
                  style={{
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <Chessboard position="start" boardWidth={450} />
                </div>
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <h3 style={{ margin: "0" }}>
                    {selectedGame.white.username} vs{" "}
                    {selectedGame.black.username}
                  </h3>
                  <p style={{ color: "#666" }}>ID: {selectedGame._id}</p>
                </div>
              </div>

              {/* 분석 차트 섹션 */}
              <div
                style={{
                  flex: 1,
                  minWidth: "450px",
                  height: "500px",
                  backgroundColor: "white",
                  padding: "30px",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <h3 style={{ marginBottom: "30px" }}>Evaluation Flow</h3>
                <div style={{ width: "100%", height: "350px" }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={analysis}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f3f5"
                      />
                      <XAxis
                        dataKey="move_number"
                        stroke="#adb5bd"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        domain={[-5, 5]}
                        stroke="#adb5bd"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                        }}
                      />
                      <ReferenceLine y={0} stroke="#495057" strokeWidth={1} />
                      <Line
                        type="monotone"
                        dataKey="eval"
                        stroke="#339af0"
                        strokeWidth={4}
                        dot={(props: CustomDotProps) => {
                          // 내부 구조를 알기 위해 임시로 any를 쓰거나, 아래처럼 구조 분해 할당을 사용합니다.
                          const { cx, cy, payload } = props;

                          // 1. 좌표가 없으면 아무것도 그리지 않습니다 (TypeScript 에러 방지 핵심)
                          if (cx === undefined || cy === undefined)
                            return <></>;

                          // 2. 블런더(Blunder)인 경우 큰 빨간 점
                          if (payload?.is_blunder) {
                            return (
                              <circle
                                key={`blunder-${payload?.move_number}`}
                                cx={cx}
                                cy={cy}
                                r={6}
                                fill="#ff6b6b"
                                stroke="white"
                                strokeWidth={2}
                              />
                            );
                          }

                          // 3. 일반적인 경우 작은 파란 점
                          return (
                            <circle
                              key={`dot-${payload?.move_number}`}
                              cx={cx}
                              cy={cy}
                              r={2}
                              fill="#339af0"
                            />
                          );
                        }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div
                  style={{
                    marginTop: "20px",
                    fontSize: "0.9rem",
                    color: "#868e96",
                  }}
                >
                  <span style={{ color: "#ff6b6b", fontWeight: "bold" }}>
                    ●
                  </span>{" "}
                  빨간 점은 1.5점 이상의 손실이 발생한 <b>블런더(Blunder)</b>
                  입니다.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#adb5bd",
            }}
          >
            <h2>게임을 선택하여 분석을 시작하세요</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
