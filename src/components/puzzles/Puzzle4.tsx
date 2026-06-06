import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRealtime } from '../../context/useRealtime';
import { Map, Eye, EyeOff, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { getPuzzle4Config } from '../../lib/puzzleRandom';

const Puzzle4 = () => {
  const { isHost, appState, broadcastEvent, updateAppState, channel } = useRealtime();
  const config = getPuzzle4Config(appState.gameSeed, appState.p4Attempt);
  const [playerState, setPlayerState] = useState({ attempt: appState.p4Attempt, pos: config.start });
  const [hitWall, setHitWall] = useState(false);
  const playerPos = playerState.attempt === appState.p4Attempt ? playerState.pos : config.start;

  const triggerHit = useCallback(() => {
    setHitWall(true);
    setTimeout(() => setHitWall(false), 500);
  }, []);

  useEffect(() => {
    if (!channel) return;
    let active = true;

    channel.on('broadcast', { event: 'maze_move' }, (payload) => {
      if (active && payload.payload) {
        if (payload.payload.attempt !== undefined) {
          setPlayerState({ attempt: payload.payload.attempt, pos: payload.payload.pos });
        } else {
          setPlayerState({ attempt: appState.p4Attempt, pos: payload.payload.pos });
        }
        if (payload.payload.hit) {
          triggerHit();
        }
      }
    });

    channel.on('broadcast', { event: 'maze_win' }, () => {
      if (active) {
        setTimeout(() => updateAppState({ currentPuzzle: 5 }), 2000);
      }
    });

    return () => {
      active = false;
    };
  }, [channel, triggerHit, updateAppState]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!isHost || hitWall) return; // Only Luca controls, pause if hit

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Out of bounds check
    if (newX < 0 || newX >= config.size || newY < 0 || newY >= config.size) {
      return;
    }

    // Wall check
    if (config.maze[newY][newX] === 1) {
      // Hit a wall! Reset.
      triggerHit();
      const nextAttempt = appState.p4Attempt + 1;
      setPlayerState({ attempt: nextAttempt, pos: config.start });
      updateAppState({ p4Attempt: nextAttempt });
      broadcastEvent('maze_move', { pos: config.start, hit: true, attempt: nextAttempt });
      return;
    }

    const newPos = { x: newX, y: newY };
    setPlayerState({ attempt: appState.p4Attempt, pos: newPos });
    broadcastEvent('maze_move', { pos: newPos, hit: false });

    // Win check
    if (newX === config.end.x && newY === config.end.y) {
      broadcastEvent('maze_win', {});
      setTimeout(() => updateAppState({ currentPuzzle: 5 }), 2000);
    }
  }, [appState.p4Attempt, broadcastEvent, config, hitWall, isHost, playerPos, triggerHit, updateAppState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHost) return;
      switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, isHost]);

  return (
    <div className="w-full h-full flex flex-col p-4 font-mono relative min-h-[500px] items-center">
      <div className="flex items-center gap-3 mb-4 w-full max-w-md pb-4 border-b border-zinc-800">
        {isHost ? <EyeOff className="text-zinc-500 w-5 h-5" /> : <Eye className="text-zinc-500 w-5 h-5" />}
        <span className="text-xs text-zinc-500 uppercase tracking-widest">
          {isHost ? 'Luca' : 'Mimi'} // O Labirinto Cego
        </span>
      </div>

      <p className="text-sm text-zinc-400 mb-6 text-center max-w-sm">
        {isHost 
          ? "Você não pode ver as paredes. Siga as instruções da Mimi cuidadosamente. Se bater, voltará ao início." 
          : "Guie o Luca até o final (Ponto Verde). Ele não consegue ver as paredes do labirinto!"}
      </p>

      <motion.div 
        animate={hitWall ? { x: [-10, 10, -10, 10, 0], borderColor: '#ef4444' } : { borderColor: '#3f3f46' }}
        transition={{ duration: 0.4 }}
        className="relative bg-zinc-950 border-2 rounded-xl p-2 mb-8 touch-none shadow-2xl"
      >
        <div 
          className="grid gap-1 bg-zinc-900 rounded-lg p-1"
          style={{ gridTemplateColumns: `repeat(${config.size}, minmax(0, 1fr))` }}
        >
          {config.maze.map((row, y) => (
            row.map((cell, x) => {
              const isWall = cell === 1;
              const isEnd = x === config.end.x && y === config.end.y;
              const isPlayer = x === playerPos.x && y === playerPos.y;

              // Luca doesn't see walls. Mimi sees them.
              const showWall = !isHost && isWall;

              return (
                <div 
                  key={`${x}-${y}`} 
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md relative flex items-center justify-center
                    ${showWall ? 'bg-zinc-700' : 'bg-zinc-800/50'}
                    ${isEnd ? 'bg-green-900/40 border border-green-500/50' : ''}
                  `}
                >
                  {isPlayer && (
                    <motion.div 
                      layoutId="player"
                      initial={false}
                      className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] z-10"
                    />
                  )}
                  {!isPlayer && isEnd && (
                     <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
              );
            })
          ))}
        </div>

        {hitWall && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/40 rounded-xl z-20 backdrop-blur-[1px]">
            <div className="bg-red-900 text-white px-4 py-2 rounded font-bold flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Bateu!
            </div>
          </div>
        )}
      </motion.div>

      {/* On-screen controls for Luca (especially for mobile) */}
      {isHost && (
        <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
          <div />
          <button 
            onClick={() => movePlayer(0, -1)}
            className="bg-zinc-800 active:bg-zinc-700 p-4 rounded-xl flex justify-center items-center"
          >
            <ArrowUp className="w-6 h-6 text-zinc-300" />
          </button>
          <div />
          <button 
            onClick={() => movePlayer(-1, 0)}
            className="bg-zinc-800 active:bg-zinc-700 p-4 rounded-xl flex justify-center items-center"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-300" />
          </button>
          <button 
            onClick={() => movePlayer(0, 1)}
            className="bg-zinc-800 active:bg-zinc-700 p-4 rounded-xl flex justify-center items-center"
          >
            <ArrowDown className="w-6 h-6 text-zinc-300" />
          </button>
          <button 
            onClick={() => movePlayer(1, 0)}
            className="bg-zinc-800 active:bg-zinc-700 p-4 rounded-xl flex justify-center items-center"
          >
            <ArrowRight className="w-6 h-6 text-zinc-300" />
          </button>
        </div>
      )}

      {!isHost && (
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl max-w-sm w-full text-center">
          <Map className="w-6 h-6 text-pink-500 mx-auto mb-2" />
          <p className="text-xs text-zinc-400">
            Você é a navegadora. Diga ao Luca quantos passos dar e em qual direção para evitar as paredes ocultas.
          </p>
        </div>
      )}
    </div>
  );
};

export default Puzzle4;
