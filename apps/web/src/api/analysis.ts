import axios from 'axios';

// 오라클 서버의 내부 또는 Tailscale IP 주소. 프론트엔드가 브라우저에서 실행되므로 
// 접속 중인 IP와 동일한 주소(또는 localhost:8000)를 사용해야 합니다.
const SERVER_URL = `http://${window.location.hostname}:8000`;

export interface ServerAnalysisResult {
  moveIndex: number;
  evaluation: string;
  numeric: number;
  bestMove: string;
}

/**
 * PGN 문자열을 서버로 보내 전체 게임 분석 결과를 받아옵니다.
 */
export const requestFullAnalysis = async (pgn: string, depth: number = 12): Promise<ServerAnalysisResult[]> => {
  try {
    const response = await axios.post(`${SERVER_URL}/analyze`, {
      pgn,
      depth
    });
    return response.data;
  } catch (error) {
    console.error('Full analysis request failed:', error);
    throw error;
  }
};
