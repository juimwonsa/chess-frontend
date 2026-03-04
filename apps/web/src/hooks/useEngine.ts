import { useState, useRef, useEffect, useCallback } from 'react';
import { Chess, Square } from 'chess.js';

export interface Suggestion {
  pv: string;
  bestMove: string;
  evaluation: string;
}

export const useEngine = (fen: string, analysisEnabled: boolean, turn: 'w' | 'b') => {
  const engineRef = useRef<Worker | null>(null);
  const [evaluation, setEvaluation] = useState<string>('0.00');
  const [bestMove, setBestMove] = useState<string>('');
  const [arrows, setArrows] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    const stockfish = new Worker('/stockfish.js');
    engineRef.current = stockfish;

    const pvMap: Record<number, Suggestion> = {};

    stockfish.onmessage = (e) => {
      const line = e.data;
      
      if (line.includes('info depth')) {
        const depthMatch = line.match(/depth (\d+)/);
        const currentDepth = depthMatch ? parseInt(depthMatch[1]) : 0;
        if (currentDepth < 10) return;

        const multiPvMatch = line.match(/multipv (\d+)/);
        const pvIndex = multiPvMatch ? parseInt(multiPvMatch[1]) : 1;

        const scoreMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        const pvMatch = line.match(/ pv (.+)/);

        let currentEval = '0.00';
        if (scoreMatch) {
          let cp = parseInt(scoreMatch[1]);
          if (turn === 'b') cp = -cp;
          currentEval = (cp / 100).toFixed(2);
          if (parseFloat(currentEval) > 0) currentEval = `+${currentEval}`;
        } else if (mateMatch) {
          let mate = parseInt(mateMatch[1]);
          if (turn === 'b') mate = -mate;
          currentEval = `M${mate}`;
        }

        if (pvMatch) {
          const pvStr = pvMatch[1];
          const move = pvStr.split(' ')[0];
          
          pvMap[pvIndex] = {
            pv: pvStr,
            bestMove: move,
            evaluation: currentEval
          };

          if (pvIndex === 1) {
            setEvaluation(currentEval);
            setBestMove(move);
          }

          const sortedPvIndices = Object.keys(pvMap)
            .map(key => parseInt(key))
            .sort((a, b) => a - b);
          
          const sortedSuggestions = sortedPvIndices.map(key => pvMap[key]);
          setSuggestions(sortedSuggestions);

          // 화살표 생성 (순위별 굵기 및 투명도 적용)
          // 1위: 검정, 100% (rgba(0,0,0,1))
          // 2위: 검정, 60% (rgba(0,0,0,0.6))
          // 3위: 검정, 30% (rgba(0,0,0,0.3))
          const newArrows = sortedPvIndices.map((index) => {
            const sug = pvMap[index];
            const moveStr = sug.bestMove;
            if (moveStr.length >= 4) {
              const from = moveStr.substring(0, 2);
              const to = moveStr.substring(2, 4);
              const opacity = index === 1 ? 1 : index === 2 ? 0.6 : 0.3;
              return {
                startSquare: from as Square,
                endSquare: to as Square,
                color: `rgba(0, 0, 0, ${opacity})`
              };
            }
            return null;
          }).filter(Boolean);

          setArrows(newArrows);
        }
      }
    };

    stockfish.postMessage('uci');
    stockfish.postMessage('setoption name Hash value 128');
    stockfish.postMessage('setoption name MultiPV value 3');
    stockfish.postMessage('isready');
    stockfish.postMessage('ucinewgame');

    return () => {
      stockfish.terminate();
    };
  }, [turn]);

  useEffect(() => {
    if (analysisEnabled && engineRef.current) {
      // 국면이 바뀌면 즉시 이전 분석 데이터 초기화
      setArrows([]);
      setSuggestions([]);
      setEvaluation('0.00');
      setBestMove('');

      engineRef.current.postMessage('stop');
      engineRef.current.postMessage(`position fen ${fen}`);
      engineRef.current.postMessage('go depth 18');
    }
  }, [fen, analysisEnabled]);

  const stopEngine = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.postMessage('stop');
    }
  }, []);

  return { evaluation, bestMove, arrows, suggestions, stopEngine };
};
