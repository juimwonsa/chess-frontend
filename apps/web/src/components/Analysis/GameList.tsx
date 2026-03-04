import React from 'react';
import { LichessGame } from '../../api/lichess';

interface GameListProps {
  games: LichessGame[];
  onSelectGame: (game: LichessGame) => void;
}

export const GameList: React.FC<GameListProps> = ({ games, onSelectGame }) => {
  if (games.length === 0) return <p style={{ textAlign: 'center', padding: '20px' }}>No games found.</p>;

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ borderTop: '1px solid #eee' }}>
        {games.map((game) => (
          <div 
            key={game.id} 
            onClick={() => onSelectGame(game)}
            style={{ 
              padding: '20px 0', 
              borderBottom: '1px solid #eee', 
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'transparent',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.paddingLeft = '10px';
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.paddingLeft = '0';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>
                <span style={{ color: '#27ae60' }}>{game.players.white.user?.name || 'Anonymous'}</span> 
                <span style={{ color: '#95a5a6', margin: '0 10px', fontWeight: 'normal' }}>vs</span>
                <span style={{ color: '#c0392b' }}>{game.players.black.user?.name || 'Anonymous'}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '8px', display: 'flex', gap: '15px' }}>
                <span>📅 {new Date(game.createdAt).toLocaleDateString()}</span>
                <span>⏱️ {game.speed} • {game.perf}</span>
                <span>🏅 {game.rated ? 'Rated' : 'Casual'}</span>
              </div>
            </div>
            
            <div style={{ textAlign: 'right', minWidth: '100px' }}>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: 'bold', 
                color: game.winner === 'white' ? '#27ae60' : game.winner === 'black' ? '#c0392b' : '#7f8c8d',
                backgroundColor: '#f1f2f6',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                {game.winner ? `${game.winner.toUpperCase()} WON` : 'DRAW'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
