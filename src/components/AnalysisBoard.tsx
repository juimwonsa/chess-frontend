// src/components/AnalysisBoard.tsx
import { Chessboard, ChessboardProvider } from "react-chessboard";

interface AnalysisBoardProps {
  position: string;
}

export const AnalysisBoard = ({ position }: AnalysisBoardProps) => {
  // position이 이상한 값일 경우를 대비한 안전장치
  const currentPosition = position || "start";

  const chessboardOptions = {
    position: currentPosition,
    id: "analysis-board",
    allowDragging: false,
    showNotation: true,
  };

  // 만약 여기서 에러가 나면 <div>만이라도 나오는지 확인하기 위해
  // 아래와 같이 감싸는 구조를 확실히 합니다.
  return (
    <div style={{ width: "450px", minHeight: "450px", backgroundColor: "#f1f3f5" }}>
      <ChessboardProvider options={chessboardOptions}>
        <Chessboard />
      </ChessboardProvider>
    </div>
  );
};
