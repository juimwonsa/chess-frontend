import chess
import chess.engine
import chess.pgn
import io
import asyncio
import os

class ChessAnalyzer:
    def __init__(self, stockfish_path="stockfish"):
        self.stockfish_path = stockfish_path

    async def analyze_game(self, pgn_string: str, depth=12):
        """
        PGN 문자열을 받아 모든 수의 분석 결과를 리스트로 반환합니다.
        """
        pgn = io.StringIO(pgn_string)
        game = chess.pgn.read_game(pgn)
        if not game:
            return []

        # Stockfish 엔진 시작
        # 참고: 오라클 서버에 설치된 stockfish 경로를 맞춰야 합니다.
        try:
            transport, engine = await chess.engine.popen_uci(self.stockfish_path)
        except Exception as e:
            return {"error": f"Stockfish not found at {self.stockfish_path}. Please install it."}

        board = game.board()
        results = []

        # 초기 상태 분석 (0번째 수)
        results.append(await self._get_eval(engine, board, depth, 0))

        # 게임의 각 수를 따라가며 분석
        for i, move in enumerate(game.mainline_moves()):
            board.push(move)
            eval_data = await self._get_eval(engine, board, depth, i + 1)
            results.append(eval_data)

        await engine.quit()
        return results

    async def _get_eval(self, engine, board, depth, move_index):
        info = await engine.analyse(board, chess.engine.Limit(depth=depth))
        score = info["score"].white()

        # 점수 포맷팅 (Mate인 경우 M으로 표시)
        if score.is_mate():
            eval_str = f"M{score.mate()}"
            numeric_eval = 10.0 if score.mate() > 0 else -10.0
        else:
            cp = score.score()
            eval_str = f"{cp/100:+.2f}"
            numeric_eval = cp / 100

        return {
            "moveIndex": move_index - 1, # -1은 시작 전 상태
            "evaluation": eval_str,
            "numeric": numeric_eval,
            "bestMove": info.get("pv", [None])[0].uci() if info.get("pv") else ""
        }
