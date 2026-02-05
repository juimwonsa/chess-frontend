import type { Game } from "../types/chess";

interface GameListProps {
  games: Game[];
  selectedGameId?: string;
  onSelectGame: (gameId: string) => void;
}

export const GameList = ({ games, selectedGameId, onSelectGame }: GameListProps) => {
  return (
    <div style={{ width: "350px", borderRight: "1px solid #dee2e6", padding: "20px", overflowY: "auto", backgroundColor: "white" }}>
      <h2 style={{ marginBottom: "20px" }}>♟️ Analysis</h2>
      {games.map((game) => (
        <div
          key={game._id}
          onClick={() => onSelectGame(game._id)}
          style={{
            padding: "15px",
            borderBottom: "1px solid #f1f3f5",
            cursor: "pointer",
            backgroundColor: selectedGameId === game._id ? "#e7f5ff" : "transparent",
            borderRadius: "10px",
            transition: "0.2s",
            marginBottom: "5px",
          }}
        >
          <div style={{ fontWeight: "bold" }}>
            {game.white.username} vs {game.black.username}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#868e96" }}>{new Date(game.end_time * 1000).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
};
