import React from 'react';

interface EvalBarProps {
  evaluation: string;
}

export const EvalBar: React.FC<EvalBarProps> = ({ evaluation }) => {
  const getEvalPercent = (evalStr: string) => {
    if (evalStr.startsWith('M')) {
      return evalStr.includes('-') ? 0 : 100;
    }
    const val = parseFloat(evalStr) || 0;
    const clamped = Math.max(-5, Math.min(5, val));
    return 50 + (clamped / 10) * 100;
  };

  const percent = getEvalPercent(evaluation);
  const isWhiteAdvantage = parseFloat(evaluation) > 0;

  return (
    <div style={{ 
      width: '32px', 
      backgroundColor: '#262421', // Lichess 다크 배경
      borderRadius: '2px', 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column-reverse',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      height: '100%',
      border: '1px solid #334155'
    }}>
      <div style={{ 
        height: `${percent}%`, 
        backgroundColor: '#fffcf2', // 백의 영역
        width: '100%',
        transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }} />
      
      {/* 0.0 중앙 가이드라인 */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: 0, 
        right: 0, 
        height: '1px', 
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
        zIndex: 2
      }} />

      <div style={{ 
        position: 'absolute', 
        top: isWhiteAdvantage ? 'auto' : '8px',
        bottom: isWhiteAdvantage ? '8px' : 'auto',
        left: 0, 
        right: 0, 
        textAlign: 'center', 
        fontSize: '11px', 
        fontWeight: '900',
        fontFamily: 'monospace',
        color: isWhiteAdvantage ? '#262421' : '#fffcf2',
        zIndex: 3,
        pointerEvents: 'none',
        textShadow: isWhiteAdvantage ? 'none' : '0 1px 2px rgba(0,0,0,0.5)'
      }}>
        {evaluation}
      </div>
    </div>
  );
};
