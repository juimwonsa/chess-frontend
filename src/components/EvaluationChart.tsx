import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Chess } from "chess.js";
import type { AnalysisMove, CustomDotProps } from "../types/chess";

interface EvaluationChartProps {
  analysis: AnalysisMove[];
  onHoverMove: (fen: string) => void;
}

export const EvaluationChart = ({ analysis, onHoverMove }: EvaluationChartProps) => {
  // 마우스 호버 시 실행되는 함수
  const handleHover = (event: any) => {
    if (event && event.activeTooltipIndex !== undefined && analysis.length > 0) {
      const moveIndex = event.activeTooltipIndex;

      if (!analysis[moveIndex]) return;

      const gameCopy = new Chess();
      // 첫 수부터 마우스가 가리키는 수까지 기보를 재생합니다.
      for (let i = 0; i <= moveIndex; i++) {
        try {
          if (analysis[i]) {
            gameCopy.move(analysis[i].move);
          }
        } catch (e) {
          break; // 수 오류 시 중단
        }
      }

      // 계산된 FEN을 부모(App.tsx)로 전달하여 체스판을 업데이트합니다.
      onHoverMove(gameCopy.fen());
    }
  };

  return (
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
            onMouseMove={handleHover}
            onMouseLeave={() => onHoverMove("start")} // 차트를 벗어나면 초기 포지션으로
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f5" />
            <XAxis dataKey="move_number" stroke="#adb5bd" tick={{ fontSize: 12 }} />
            <YAxis domain={[-5, 5]} stroke="#adb5bd" tick={{ fontSize: 12 }} />
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
                const { cx, cy, payload } = props;
                if (cx === undefined || cy === undefined) return <script />;

                if (payload?.is_blunder) {
                  return <circle key={`blunder-${payload.move_number}`} cx={cx} cy={cy} r={6} fill="#ff6b6b" stroke="white" strokeWidth={2} />;
                }

                return <circle key={`dot-${payload?.move_number}`} cx={cx} cy={cy} r={2} fill="#339af0" />;
              }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: "20px", fontSize: "0.9rem", color: "#868e96" }}>
        <span style={{ color: "#ff6b6b", fontWeight: "bold" }}>●</span> 빨간 점은 1.5점 이상의 손실이 발생한 <b>블런더(Blunder)</b>입니다.
      </div>
    </div>
  );
};
