import { Move } from "chess.js";

interface MoveListProps {
  history: Move[];
  currentMoveIndex: number;
  onMoveClick: (index: number) => void;
}

export const MoveList = ({ history, currentMoveIndex, onMoveClick }: MoveListProps) => {
  return (
    <div
      style={{
        width: "100%", // 고정 300px 대신 100%
        maxWidth: "400px", // 최대 너비 제한
        height: "400px", // 높이는 고정하거나 상황에 맞춰 조절
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        overflowY: "auto",
        padding: "15px",
      }}
    >
      <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>기보 기록</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
        {history.map((move, index) => (
          <div
            key={index}
            onClick={() => onMoveClick(index)}
            style={{
              padding: "8px",
              cursor: "pointer",
              borderRadius: "4px",
              backgroundColor: currentMoveIndex === index ? "#e7f5ff" : "transparent",
              border: currentMoveIndex === index ? "1px solid #339af0" : "1px solid #eee",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            {Math.floor(index / 2) + 1}. <b>{move.san}</b>
          </div>
        ))}
      </div>
    </div>
  );
};
