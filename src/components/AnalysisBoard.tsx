import { Chessboard } from "react-chessboard";

interface AnalysisBoardProps {
  position: string;
}

export const AnalysisBoard = ({ position }: AnalysisBoardProps) => {
  return (
    <div style={{ width: "450px" }}>
      <div style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.15)", borderRadius: "4px", overflow: "hidden" }}>
        <Chessboard
          // 라이브러리 사양에 따라 options가 필요하다면 아래처럼 유지합니다.
          // 만약 Piece2 에러가 지속되면 options={...}를 제거하고 position={position}으로 직접 써보세요.
          options={{
            position: position,
            boardStyle: { width: "450px" },
            showNotation: true,
            allowDragging: false,
          }}
        />
      </div>
    </div>
  );
};
