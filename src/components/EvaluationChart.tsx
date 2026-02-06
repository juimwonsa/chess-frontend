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
import type { CategoricalChartFunc } from "recharts/types/chart/types";
import { Chess } from "chess.js";
import type { AnalysisMove, CustomDotProps } from "../types/chess";

interface EvaluationChartProps {
  analysis: AnalysisMove[];
  onHoverMove: (fen: string) => void;
}

export const EvaluationChart = ({
  analysis,
  onHoverMove,
}: EvaluationChartProps) => {
  // CategoricalChartFunc 규격에 맞춘 핸들러
  const handleHover: CategoricalChartFunc = (nextState) => {
    if (
      nextState &&
      nextState.activeTooltipIndex !== null &&
      nextState.activeTooltipIndex !== undefined &&
      analysis.length > 0
    ) {
      const moveIndex = Number(nextState.activeTooltipIndex);
      if (isNaN(moveIndex) || !analysis[moveIndex]) return;

      // chess.js 1.4.0 버전은 생성자 사용법이 기존과 동일하지만
      // 예외 처리가 더 강화되었습니다.
      const gameCopy = new Chess();

      for (let i = 0; i <= moveIndex; i++) {
        try {
          gameCopy.move(analysis[i].move);
        } catch {
          break; // 잘못된 수 발견 시 중단
        }
      }
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
      }}
    >
      <h3 style={{ marginBottom: "20px" }}>Evaluation Flow</h3>
      <div style={{ width: "100%", height: "350px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={analysis}
            onMouseMove={handleHover}
            onMouseLeave={() => onHoverMove("start")}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="move_number" stroke="#adb5bd" />
            <YAxis domain={[-5, 5]} stroke="#adb5bd" />
            <Tooltip />
            <ReferenceLine y={0} stroke="#495057" />
            <Line
              type="monotone"
              dataKey="eval"
              stroke="#339af0"
              strokeWidth={4}
              dot={(props: CustomDotProps) => {
                const { cx, cy, payload } = props;
                if (cx === undefined || cy === undefined) return <rect />;
                return (
                  <circle
                    key={payload?.move_number}
                    cx={cx}
                    cy={cy}
                    r={payload?.is_blunder ? 6 : 2}
                    fill={payload?.is_blunder ? "#ff6b6b" : "#339af0"}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
