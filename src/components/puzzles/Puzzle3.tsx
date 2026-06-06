import { useState, useEffect, useRef, type FormEvent, type PointerEvent } from 'react';
import { useRealtime } from '../../context/useRealtime';
import { Lock, Search } from 'lucide-react';
import { getPuzzle3Config } from '../../lib/puzzleRandom';

const Puzzle3 = () => {
  const { isHost, appState, broadcastEvent, updateAppState, channel } = useRealtime();
  const [lightPos, setLightPos] = useState({ x: 0.5, y: 0.5 }); // Relative coordinates
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const config = getPuzzle3Config(appState.gameSeed);

  useEffect(() => {
    if (!channel) return;
    let active = true;

    // Listen for cursor movement from the other device
    channel.on('broadcast', { event: 'cursor_move' }, (payload) => {
      // Ignore if it's from us (though broadcastEvent adds senderId, we can just rely on who is host/guest)
      // Actually, if only Luca sends it, Mimi just receives.
      if (active && payload.payload) {
        setLightPos({ x: payload.payload.x, y: payload.payload.y });
      }
    });

    return () => {
      active = false;
    };
  }, [channel]);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    // Only Luca controls the flashlight
    if (!isHost || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setLightPos({ x, y });
    broadcastEvent('cursor_move', { x, y });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password.trim().toUpperCase() === config.password) {
      updateAppState({ currentPuzzle: 4 });
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const revealRadius = 0.16;

  const getFragmentOpacity = (top: string, left: string) => {
    const y = parseFloat(top) / 100;
    const x = parseFloat(left) / 100;
    const distance = Math.hypot(lightPos.x - x, lightPos.y - y);
    if (distance < revealRadius * 0.55) return 1;
    if (distance < revealRadius) return 0.45;
    return 0.03;
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-[60vh] min-h-[400px] relative overflow-hidden bg-black rounded-xl border border-zinc-800 touch-none flex flex-col items-center justify-end p-6"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove} // Also update on touch start
    >
      {/* Background layer for Luca (pure black, instructions only) */}
      {isHost && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center pointer-events-none opacity-30">
          <p className="text-zinc-500 font-mono text-sm max-w-[200px]">
            Você tem a lanterna. Ilumine o caminho para a Mimi encontrar a resposta.
          </p>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none bg-[#050505]">
        {!isHost &&
          config.fragments.map((fragment) => (
            <span
              key={fragment.id}
              className={`absolute font-mono font-bold uppercase tracking-widest transition-opacity duration-150 ${
                fragment.isPasswordPart ? 'text-pink-400 text-xl' : 'text-zinc-500 text-sm'
              }`}
              style={{
                ...fragment.pos,
                opacity: getFragmentOpacity(fragment.pos.top, fragment.pos.left),
                transform: `rotate(${fragment.rotation}deg)`,
                textShadow: fragment.isPasswordPart ? '0 0 10px rgba(236,72,153,0.8)' : undefined,
              }}
            >
              {fragment.text}
            </span>
          ))}

        <div
          className="absolute rounded-full border border-pink-500/20 bg-pink-400/10 blur-sm"
          style={{
            width: 120,
            height: 120,
            left: `calc(${lightPos.x * 100}% - 60px)`,
            top: `calc(${lightPos.y * 100}% - 60px)`,
          }}
        />
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 w-full max-w-xs mt-auto bg-zinc-900/80 p-4 rounded-xl backdrop-blur-sm border border-zinc-700/50">
        {!isHost && (
          <p className="text-xs text-pink-400 mb-3 text-center">
            Dica: Junte as palavras em destaque para formar a senha.
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-zinc-300 mb-1">
            {isHost ? <Search className="w-4 h-4 text-pink-400" /> : <Lock className="w-4 h-4 text-pink-400" />}
            <span className="text-sm font-semibold">{isHost ? 'Lanterna Ativa' : 'Receptor Ativo'}</span>
          </div>
          
          <input 
            type="text" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha oculta..."
            className={`bg-zinc-950 border ${error ? 'border-red-500' : 'border-zinc-800'} text-zinc-50 px-4 py-3 rounded-lg focus:outline-none focus:border-pink-500 transition-colors uppercase font-mono text-center tracking-widest`}
          />
          <button 
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Desbloquear
          </button>
        </form>
      </div>
    </div>
  );
};

export default Puzzle3;
