import { Chessboard } from "react-chessboard";

interface AnalysisBoardProps {
  position: string;
}

export const AnalysisBoard = ({ position }: AnalysisBoardProps) => {
  return (
    <div style={{ width: "450px", height: "450px" }}>
      <Chessboard
        id="main-analysis-board"
        position={position || "start"}
        allowDragging={true}
        showNotation={true}
        animationDurationInMs={200}
        boardStyle={{
          borderRadius: "4px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
};

