import { Chessboard, ChessboardProvider } from "react-chessboard";

export const SimpleBoard = ({ position }: { position: string }) => {
  const chessboardOptions = {
    id: "responsive-analysis-board",
    position: position,
    allowDragging: false,
    showNotation: true,
    animationDurationInMs: 200,
    // 핵심: 라이브러리 내부 보드 스타일이 부모를 가득 채우도록 설정
    boardStyle: {
      borderRadius: "4px",
      width: "100%",
      height: "100%",
    },
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px", // 너무 커지지 않게 제한
        aspectRatio: "1/1", // 너비에 맞춰 높이를 1:1로 고정
        position: "relative",
        display: "block", // flex의 영향을 최소화하기 위해 block으로 설정
        margin: "0 auto", // 가로 중앙 정렬
      }}
    >
      <ChessboardProvider options={chessboardOptions}>
        {/* 컨테이너의 1:1 비율을 그대로 따라가도록 설정 */}
        <Chessboard />
      </ChessboardProvider>
    </div>
  );
};
