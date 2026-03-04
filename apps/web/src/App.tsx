import { useState, useRef, useCallback, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess, Square } from 'chess.js'
import { useEngine } from './hooks/useEngine'
import { fetchUserGames, LichessGame } from './api/lichess'
import { requestFullAnalysis } from './api/analysis'
import { PieceDropHandlerArgs, SquareHandlerArgs } from './types/chess'
import { EvalBar } from './components/Board/EvalBar'
import { GameList } from './components/Analysis/GameList'
import { EvaluationChart } from './components/Analysis/EvaluationChart'

function App() {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [analysisEnabled, setAnalysisEnabled] = useState(true);
  
  const { evaluation: localEval, bestMove: localBestMove, arrows: localArrows } = useEngine(fen, analysisEnabled, gameRef.current.turn());

  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [variations, setVariations] = useState<Record<number, string[][]>>({});
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [moveEvaluations, setMoveEvaluations] = useState<{ moveIndex: number; evaluation: number }[]>([]);
  
  const [analysisCache, setAnalysisCache] = useState<Record<number, { eval: string; bestMove: string }>>({});
  const [displayArrows, setDisplayArrows] = useState<any[]>([]);

  const [moveInput, setMoveInput] = useState('');
  const [lichessUser, setLichessUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAnalyzingServer, setIsAnalyzingServer] = useState(false);
  const [gameList, setGameList] = useState<LichessGame[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'home' | 'list' | 'board'>('home');
  
  const [moveFrom, setMoveFrom] = useState<Square | ''>('');
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

  const getGameAtMove = useCallback((index: number, fullHistory: string[]) => {
    const game = new Chess();
    for (let i = 0; i <= index; i++) {
      try {
        game.move(fullHistory[i]);
      } catch (e) {
        break;
      }
    }
    return game;
  }, []);

  const handleSearchLichess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lichessUser) return;
    setIsLoading(true);
    setGameList([]);
    try {
      const games = await fetchUserGames(lichessUser, 20);
      setGameList(games);
      if (games.length > 0) {
        setLastTimestamp(games[games.length - 1].createdAt - 1);
      }
      setViewMode('list');
    } catch (err) {
      alert('Failed to fetch games: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!lichessUser || !lastTimestamp || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const newGames = await fetchUserGames(lichessUser, 20, lastTimestamp);
      if (newGames.length > 0) {
        setGameList(prev => [...prev, ...newGames]);
        setLastTimestamp(newGames[newGames.length - 1].createdAt - 1);
      } else {
        setLastTimestamp(null);
      }
    } catch (err) {
      console.error('Failed to load more games:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadSelectedGame = async (game: LichessGame) => {
    try {
      const tempGame = new Chess();
      tempGame.loadPgn(game.pgn);
      const history = tempGame.history();
      setGameHistory(history);
      setVariations({});
      setCurrentMoveIndex(-1);
      setAnalysisCache({});
      setDisplayArrows([]);
      
      setMoveEvaluations(history.map((_, i) => ({ moveIndex: i, evaluation: 0 })));
      setViewMode('board');

      setIsAnalyzingServer(true);
      try {
        const results = await requestFullAnalysis(game.pgn, 12);
        
        setMoveEvaluations(results.map(r => ({
          moveIndex: r.moveIndex,
          evaluation: r.numeric
        })));

        const cache: Record<number, { eval: string; bestMove: string }> = {};
        results.forEach(r => {
          cache[r.moveIndex] = { eval: r.evaluation, bestMove: r.bestMove };
        });
        setAnalysisCache(cache);

      } catch (err) {
        console.warn('Server analysis failed:', err);
      } finally {
        setIsAnalyzingServer(false);
      }
    } catch (err) {
      alert('Error loading game: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    const cachedData = analysisCache[currentMoveIndex];
    if (cachedData && cachedData.bestMove) {
      const move = cachedData.bestMove;
      if (move.length >= 4) {
        const from = move.substring(0, 2) as Square;
        const to = move.substring(2, 4) as Square;
        setDisplayArrows([{
          startSquare: from,
          endSquare: to,
          color: 'rgba(0, 0, 0, 0.8)'
        }]);
      } else {
        setDisplayArrows([]);
      }
    } else {
      setDisplayArrows(localArrows);
    }
  }, [currentMoveIndex, analysisCache, localArrows]);

  useEffect(() => {
    if (viewMode === 'board' && currentMoveIndex >= 0) {
      const cachedEval = analysisCache[currentMoveIndex]?.eval;
      const finalEval = cachedEval || localEval;
      const numericEval = finalEval.startsWith('M') 
        ? (finalEval.includes('-') ? -10 : 10) 
        : parseFloat(finalEval);
      
      setMoveEvaluations(prev => {
        const next = [...prev];
        const idx = next.findIndex(e => e.moveIndex === currentMoveIndex);
        if (idx !== -1) {
          next[idx] = { ...next[idx], evaluation: numericEval };
        } else if (currentMoveIndex >= next.length) {
            next.push({ moveIndex: currentMoveIndex, evaluation: numericEval });
        }
        return next;
      });
    }
  }, [localEval, analysisCache, currentMoveIndex, viewMode]);

  useEffect(() => {
    const gameAtPos = getGameAtMove(currentMoveIndex, gameHistory);
    gameRef.current = gameAtPos;
    setFen(gameAtPos.fen());
    setMoveFrom('');
    setOptionSquares({});
  }, [currentMoveIndex, gameHistory, getGameAtMove]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'board') return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft') setCurrentMoveIndex(prev => Math.max(-1, prev - 1));
      else if (e.key === 'ArrowRight') setCurrentMoveIndex(prev => Math.min(gameHistory.length - 1, prev + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameHistory.length, viewMode]);

  const switchVariation = useCallback((index: number, varIdx: number) => {
    const currentLineTail = gameHistory.slice(index + 1);
    const selectedVar = variations[index][varIdx];
    
    const newVariations = { ...variations };
    if (currentLineTail.length > 0) {
      newVariations[index] = [...variations[index]];
      newVariations[index][varIdx] = currentLineTail;
    } else {
      newVariations[index] = variations[index].filter((_, i) => i !== varIdx);
      if (newVariations[index].length === 0) delete newVariations[index];
    }
    
    const newHistory = [...gameHistory.slice(0, index + 1), ...selectedVar];
    setGameHistory(newHistory);
    setVariations(newVariations);
    setCurrentMoveIndex(index + 1);
  }, [gameHistory, variations]);

  const makeAMove = useCallback((move: any) => {
    const game = getGameAtMove(currentMoveIndex, gameHistory);
    try {
      const result = game.move(move);
      if (result) {
        // 1. 이미 같은 수가 다음 수로 존재하면 이동만 함
        if (currentMoveIndex + 1 < gameHistory.length && gameHistory[currentMoveIndex + 1] === result.san) {
           setCurrentMoveIndex(currentMoveIndex + 1);
           return result;
        }

        // 2. 이미 같은 수가 베리에이션에 존재하면 해당 베리에이션으로 스위치
        if (variations[currentMoveIndex]) {
          const varIdx = variations[currentMoveIndex].findIndex(v => v[0] === result.san);
          if (varIdx !== -1) {
            switchVariation(currentMoveIndex, varIdx);
            return result;
          }
        }

        // 3. 다른 수를 뒀을 경우, 기존의 뒷수들을 variation으로 보관
        if (currentMoveIndex + 1 < gameHistory.length) {
          const oldTail = gameHistory.slice(currentMoveIndex + 1);
          setVariations(prev => {
            const atIndex = prev[currentMoveIndex] || [];
            // 중복 체크 (이미 같은 베리에이션이 있으면 추가 안함)
            const exists = atIndex.some(v => JSON.stringify(v) === JSON.stringify(oldTail));
            if (exists) return prev;
            return { ...prev, [currentMoveIndex]: [...atIndex, oldTail] };
          });
        }

        // 4. 새로운 히스토리 적용
        const newHistory = gameHistory.slice(0, currentMoveIndex + 1);
        newHistory.push(result.san);
        setGameHistory(newHistory);
        setCurrentMoveIndex(newHistory.length - 1);
        setFen(game.fen());
        gameRef.current = game;
        return result;
      }
    } catch (e) { return null; }
    return null;
  }, [currentMoveIndex, gameHistory, getGameAtMove, variations, switchVariation]);

  const handleManualMove = (e: React.FormEvent) => {
    e.preventDefault();
    const result = makeAMove(moveInput);
    if (result) setMoveInput('');
    else alert('Invalid move: ' + moveInput);
  };

  const getMoveOptions = (square: Square) => {
    const moves = gameRef.current.moves({ square, verbose: true });
    if (moves.length === 0) { setOptionSquares({}); return false; }
    const newSquares: Record<string, React.CSSProperties> = {};
    moves.map((move) => {
      const targetPiece = gameRef.current.get(move.to);
      const sourcePiece = gameRef.current.get(square);
      newSquares[move.to] = {
        background: targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color
            ? 'radial-gradient(circle, rgba(255,255,255,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(255,255,255,.1) 20%, transparent 20%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = { background: 'rgba(255, 255, 0, 0.2)' };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick({ square }: SquareHandlerArgs) {
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }
    const result = makeAMove({ from: moveFrom, to: square, promotion: 'q' });
    if (!result) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      else { setMoveFrom(''); setOptionSquares({}); }
    }
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) return false;
    const result = makeAMove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    return result !== null;
  }

  const chessboardOptions: any = {
    position: fen,
    onPieceDrop,
    onSquareClick,
    squareStyles: optionSquares,
    arrows: displayArrows,
    animationDuration: 200,
    id: 'main-board'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        
        {viewMode === 'home' && (
          <div style={{ textAlign: 'center', marginTop: '12vh', color: '#f8fafc', padding: '0 20px' }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, marginBottom: '10px', background: 'linear-gradient(to right, #3498db, #2ecc71)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Chess Lab
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '40px' }}>Professional analysis for every game.</p>
            <form onSubmit={handleSearchLichess} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                value={lichessUser}
                onChange={(e) => setLichessUser(e.target.value)}
                placeholder="Lichess Username"
                style={{ padding: '15px 25px', fontSize: '1.1rem', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc', width: 'min(100%, 350px)', outline: 'none' }}
              />
              <button type="submit" disabled={isLoading} style={{ padding: '15px 35px', fontSize: '1.1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        )}

        {viewMode === 'list' && (
          <div style={{ color: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
              <button onClick={() => setViewMode('home')} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '8px' }}>← Back</button>
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Games for <span style={{ color: '#3b82f6' }}>{lichessUser}</span></h2>
            </div>
            <GameList games={gameList} onSelectGame={loadSelectedGame} />
            {lastTimestamp && (
              <div style={{ textAlign: 'center', margin: '50px 0' }}>
                <button onClick={handleLoadMore} disabled={isLoadingMore} style={{ padding: '12px 30px', backgroundColor: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isLoadingMore ? 'Loading...' : 'Load More Games'}
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === 'board' && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'wrap',
            gap: '30px', 
            color: '#f8fafc',
            justifyContent: 'center'
          }}>
            <div style={{ height: 'min(80vh, 600px)', width: '32px' }}>
              <EvalBar evaluation={analysisCache[currentMoveIndex]?.eval || localEval} />
            </div>

            <div style={{ flex: '1 1 500px', maxWidth: '700px', position: 'relative' }}>
              {/* 서버 분석 프로그레스 바 */}
              {isAnalyzingServer && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-10px', 
                  left: 0, 
                  right: 0, 
                  height: '4px', 
                  backgroundColor: '#1e293b', 
                  borderRadius: '2px', 
                  overflow: 'hidden',
                  zIndex: 10
                }}>
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: '#3b82f6', 
                    boxShadow: '0 0 10px #3b82f6',
                    animation: 'loading-bar 2s infinite linear' 
                  }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button onClick={() => setViewMode('list')} style={{ padding: '8px 16px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Back to List</button>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  {isAnalyzingServer && (
                    <span style={{ fontSize: '12px', color: '#f1c40f', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="spinner"></span> ⚡ Server Analyzing...
                    </span>
                  )}
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>Turn: <strong style={{ color: '#fff' }}>{gameRef.current.turn() === 'w' ? 'White' : 'Black'}</strong></div>
                </div>
              </div>

              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}>
                <Chessboard options={chessboardOptions} />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => setCurrentMoveIndex(-1)} style={{ padding: '12px', flex: 1, backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>≪</button>
                <button onClick={() => setCurrentMoveIndex(prev => Math.max(-1, prev - 1))} style={{ padding: '12px', flex: 1, backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>＜</button>
                <button onClick={() => setCurrentMoveIndex(prev => Math.min(gameHistory.length - 1, prev + 1))} style={{ padding: '12px', flex: 1, backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>＞</button>
                <button onClick={() => setCurrentMoveIndex(gameHistory.length - 1)} style={{ padding: '12px', flex: 1, backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>≫</button>
              </div>

              <div style={{ minHeight: '150px', marginTop: '20px' }}>
                <EvaluationChart data={moveEvaluations} currentIndex={currentMoveIndex} onMoveClick={setCurrentMoveIndex} />
              </div>
            </div>

            <div style={{ flex: '1 1 320px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#94a3b8' }}>Analysis</h3>
                  <label style={{ fontSize: '12px', cursor: 'pointer' }}><input type="checkbox" checked={analysisEnabled} onChange={(e) => setAnalysisEnabled(e.target.checked)} /> Auto</label>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#334155', padding: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      {analysisCache[currentMoveIndex]?.bestMove || localBestMove || '...'}
                    </div>
                    <div style={{ fontSize: '1rem', color: '#2ecc71', fontWeight: 'bold' }}>
                      {analysisCache[currentMoveIndex]?.eval || localEval}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleManualMove} style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
                    <input type="text" value={moveInput} onChange={(e) => setMoveInput(e.target.value)} placeholder="e.g. e4" style={{ flex: 1, padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#fff', outline: 'none' }} />
                    <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Go</button>
                </form>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', flex: '1', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#94a3b8' }}>Move History</h3>
                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '50vh', paddingRight: '5px' }}>
                  {variations[-1] && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px', padding: '8px', backgroundColor: '#0f172a', borderRadius: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Variations:</span>
                      {variations[-1].map((v, vIdx) => (
                        <span key={vIdx} onClick={() => switchVariation(-1, vIdx)} style={{ fontSize: '11px', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}>
                          ({v[0]}...)
                        </span>
                      ))}
                    </div>
                  )}
                  {gameHistory.reduce((acc: string[][], move, index) => {
                    if (index % 2 === 0) acc.push([move]);
                    else acc[acc.length - 1].push(move);
                    return acc;
                  }, []).map((pair, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr', gap: '10px', padding: '8px 0', borderBottom: '1px solid #334155', alignItems: 'center' }}>
                      <span style={{ color: '#475569', fontSize: '13px' }}>{index + 1}.</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span onClick={() => setCurrentMoveIndex(index * 2)} style={{ cursor: 'pointer', padding: '2px 6px', borderRadius: '3px', backgroundColor: currentMoveIndex === index * 2 ? '#3b82f6' : 'transparent', color: currentMoveIndex === index * 2 ? '#fff' : '#f8fafc' }}>
                            {pair[0]}
                          </span>
                          <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '4px' }}>
                            {analysisCache[index * 2]?.eval || ''}
                          </span>
                        </div>
                        {/* 화이트 수 직후의 베리에이션 */}
                        {variations[index * 2 - 1] && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px', paddingLeft: '4px', borderLeft: '2px solid #334155' }}>
                            {variations[index * 2 - 1].map((v, vIdx) => (
                              <span key={vIdx} onClick={() => switchVariation(index * 2 - 1, vIdx)} style={{ fontSize: '11px', color: '#64748b', cursor: 'pointer', backgroundColor: '#0f172a', padding: '0 4px', borderRadius: '2px' }}>
                                ({v[0]}...)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {pair[1] ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span onClick={() => setCurrentMoveIndex(index * 2 + 1)} style={{ cursor: 'pointer', padding: '2px 6px', borderRadius: '3px', backgroundColor: currentMoveIndex === index * 2 + 1 ? '#3b82f6' : 'transparent', color: currentMoveIndex === index * 2 + 1 ? '#fff' : '#f8fafc' }}>
                              {pair[1]}
                            </span>
                            <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '4px' }}>
                              {analysisCache[index * 2 + 1]?.eval || ''}
                            </span>
                          </div>
                          {/* 블랙 수 직후의 베리에이션 */}
                          {variations[index * 2] && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px', paddingLeft: '4px', borderLeft: '2px solid #334155' }}>
                              {variations[index * 2].map((v, vIdx) => (
                                <span key={vIdx} onClick={() => switchVariation(index * 2, vIdx)} style={{ fontSize: '11px', color: '#64748b', cursor: 'pointer', backgroundColor: '#0f172a', padding: '0 4px', borderRadius: '2px' }}>
                                  ({v[0]}...)
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {variations[index * 2] && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px', paddingLeft: '4px', borderLeft: '2px solid #334155' }}>
                              {variations[index * 2].map((v, vIdx) => (
                                <span key={vIdx} onClick={() => switchVariation(index * 2, vIdx)} style={{ fontSize: '11px', color: '#64748b', cursor: 'pointer', backgroundColor: '#0f172a', padding: '0 4px', borderRadius: '2px' }}>
                                  ({v[0]}...)
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App
