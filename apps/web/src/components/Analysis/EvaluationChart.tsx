import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface EvaluationChartProps {
  data: { moveIndex: number; evaluation: number }[];
  onMoveClick: (index: number) => void;
  currentIndex: number;
}

export const EvaluationChart: React.FC<EvaluationChartProps> = ({ data, onMoveClick, currentIndex }) => {
  return (
    <div style={{ width: '100%', height: '150px', backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px', marginTop: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          onClick={(e) => e && e.activeLabel && onMoveClick(parseInt(e.activeLabel))}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="moveIndex" hide />
          <YAxis domain={[-5, 5]} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff' }}
            itemStyle={{ color: '#3498db' }}
          />
          <ReferenceLine y={0} stroke="#475569" />
          <Line 
            type="monotone" 
            dataKey="evaluation" 
            stroke="#3498db" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 4, onClick: (_, payload: any) => onMoveClick(payload.moveIndex) }}
          />
          {/* 현재 위치 표시선 */}
          <ReferenceLine x={currentIndex} stroke="#f1c40f" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
