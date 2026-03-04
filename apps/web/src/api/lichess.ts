import axios from 'axios';

const LICHESS_API_URL = 'https://lichess.org/api';

export interface LichessGame {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt: number;
  status: string;
  players: {
    white: { user?: { name: string }; rating: number };
    black: { user?: { name: string }; rating: number };
  };
  pgn: string;
  winner?: string;
}

/**
 * 특정 유저의 최근 게임들을 가져옵니다.
 * @param username Lichess 유저명
 * @param count 가져올 게임 수
 * @param until 이 시간(ms) 이전의 게임들을 가져옵니다 (페이지네이션용)
 */
export const fetchUserGames = async (username: string, count: number = 20, until?: number): Promise<LichessGame[]> => {
  try {
    const response = await axios.get(`${LICHESS_API_URL}/games/user/${username}`, {
      params: {
        max: count,
        until: until, // 페이지네이션 핵심 파라미터
        pgnInJson: true,
        clocks: true,
        evals: true,
        opening: true,
      },
      headers: {
        'Accept': 'application/x-ndjson',
      }
    });

    // NDJSON 파싱 (한 줄씩 JSON 객체임)
    const gamesRaw = response.data.split('\n').filter((line: string) => line.trim() !== '');
    return gamesRaw.map((game: string) => JSON.parse(game));
  } catch (error) {
    console.error('Error fetching Lichess games:', error);
    throw error;
  }
};

/**
 * 유저의 실시간 진행 중인 게임 상태(FEN)를 가져옵니다.
 * (로그인 없이도 공개된 실시간 상태 확인 가능)
 */
export const fetchLiveGameStatus = async (username: string) => {
    try {
      const response = await axios.get(`${LICHESS_API_URL}/user/${username}/current-game`, {
        headers: { 'Accept': 'application/x-chess-pgn' }
      });
      return response.data; // PGN 혹은 FEN 데이터
    } catch (error) {
      console.error('Error fetching live game:', error);
      return null;
    }
};
