import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Chess } from "chess.js";
// 'import type'을 사용하여 TypeScript 에러를 해결합니다.
import type { AnalysisMove, CustomDotProps } from "../types/chess";

interface EvaluationChartProps {
  analysis: AnalysisMove[];
  onHoverMove: (fen: string) => void;
}

export const EvaluationChart = ({ analysis, onHoverMove }: EvaluationChartProps) => {
  const handleHover = (event: any) => {
    if (event && event.activeTooltipIndex !== undefined && analysis.length > 0) {
      const moveIndex = event.activeTooltipIndex;
      const gameCopy = new Chess();

      for (let i = 0; i <= moveIndex; i++) {
        try {
          gameCopy.move(analysis[i].move);
        } catch (e) {
          break;
        }
      }
      onHoverMove(gameCopy.fen());
    }
  };

  return (
    <div style={{ flex: 1, height: "500px", backgroundColor: "white", padding: "30px", borderRadius: "20px" }}>
      <h3 style={{ marginBottom: "20px" }}>Evaluation Flow</h3>
      <div style={{ width: "100%", height: "350px" }}>
        <ResponsiveContainer>
          <LineChart data={analysis} onMouseMove={handleHover} onMouseLeave={() => onHoverMove("start")}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="move_number" />
            <YAxis domain={[-5, 5]} />
            <Tooltip />
            <ReferenceLine y={0} stroke="#000" />
            <Line
              type="monotone"
              dataKey="eval"
              stroke="#339af0"
              strokeWidth={3}
              dot={(props: CustomDotProps) => {
                const { cx, cy, payload } = props;
                if (cx === undefined || cy === undefined) return <rect />;
                return <circle cx={cx} cy={cy} r={payload?.is_blunder ? 6 : 2} fill={payload?.is_blunder ? "#ff6b6b" : "#339af0"} />;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
