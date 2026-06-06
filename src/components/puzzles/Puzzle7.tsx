import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Hand, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/useRealtime';
import { getPuzzle7Config } from '../../lib/puzzleRandom';

type Point = {
  x: number;
  y: number;
};

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const Puzzle7 = () => {
  const navigate = useNavigate();
  const { isHost, appState, updateAppState, broadcastEvent, channel } = useRealtime();
  const config = getPuzzle7Config(appState.gameSeed);
  const target = isHost ? config.lucaTarget : config.mimiTarget;
  const [point, setPoint] = useState<Point>({ x: 150, y: 75 });
  const [dragging, setDragging] = useState(false);
  const [localHolding, setLocalHolding] = useState(false);
  const [partnerHolding, setPartnerHolding] = useState(false);
  const [result, setResult] = useState<'idle' | 'charging' | 'success'>('idle');
  const boardRef = useRef<HTMLDivElement>(null);

  const aligned = distance(point, target) <= 16;
  const partnerAligned = isHost ? appState.p7MimiAligned : appState.p7LucaAligned;

  const stars = useMemo(
    () =>
      isHost
        ? [
            { x: -26, y: -16 },
            { x: -8, y: 4 },
            { x: 18, y: -8 },
            { x: 30, y: 20 },
          ]
        : [
            { x: -30, y: 18 },
            { x: -14, y: -8 },
            { x: 12, y: 6 },
            { x: 28, y: -18 },
          ],
    [isHost],
  );

  useEffect(() => {
    const currentAligned = isHost ? appState.p7LucaAligned : appState.p7MimiAligned;
    if (currentAligned !== aligned) {
      updateAppState(isHost ? { p7LucaAligned: aligned } : { p7MimiAligned: aligned });
    }
  }, [aligned, appState.p7LucaAligned, appState.p7MimiAligned, isHost, updateAppState]);

  useEffect(() => {
    if (!channel) return;
    let active = true;

    channel.on('broadcast', { event: 'final_hold' }, (payload) => {
      if (!active || typeof payload.payload?.holding !== 'boolean') return;
      setPartnerHolding(payload.payload.holding);
    });

    channel.on('broadcast', { event: 'final_sync_success' }, () => {
      if (!active) return;
      setResult('success');
      updateAppState({ isMemorialUnlocked: true });
      setTimeout(() => navigate('/memorial'), 1500);
    });

    return () => {
      active = false;
    };
  }, [channel, updateAppState, navigate]);

  useEffect(() => {
    if (!aligned || !partnerAligned || !localHolding || !partnerHolding) {
      if (result === 'charging') setResult('idle');
      return;
    }

    setResult('charging');
    const timeout = setTimeout(() => {
      setResult('success');
      updateAppState({ isMemorialUnlocked: true });
      broadcastEvent('final_sync_success', {});
      setTimeout(() => navigate('/memorial'), 1500);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [aligned, broadcastEvent, localHolding, partnerAligned, partnerHolding, result, updateAppState, navigate]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    // Initial move
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      setResult('idle');
      setPoint({
        x: Math.min(292, Math.max(8, ((event.clientX - rect.left) / rect.width) * 300)),
        y: Math.min(142, Math.max(8, ((event.clientY - rect.top) / rect.height) * 150)),
      });
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    setResult('idle');
    setPoint({
      x: Math.min(292, Math.max(8, ((event.clientX - rect.left) / rect.width) * 300)),
      y: Math.min(142, Math.max(8, ((event.clientY - rect.top) / rect.height) * 150)),
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };

  const startHold = () => {
    if (!aligned || !partnerAligned || result === 'success') return;
    setLocalHolding(true);
    broadcastEvent('final_hold', { holding: true });
  };

  const stopHold = () => {
    setLocalHolding(false);
    if (result === 'charging') setResult('idle');
    broadcastEvent('final_hold', { holding: false });
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-mono min-h-[560px]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
        <Sparkles className="text-zinc-500 w-5 h-5" />
        <span className="text-xs text-zinc-500 uppercase tracking-widest">
          {isHost ? 'Luca' : 'Mimi'} // The Merge
        </span>
      </div>

      <p className="text-sm text-zinc-400 text-center leading-relaxed mb-6">
        Arraste sua metade até o alvo. Quando as duas metades estiverem alinhadas, segurem Sincronizar ao mesmo tempo.
      </p>

      <div
        ref={boardRef}
        className="relative bg-black border border-zinc-800 rounded-xl mb-5 h-56 overflow-hidden touch-none"
      >
        <svg viewBox="0 0 300 150" className="absolute inset-0 w-full h-full pointer-events-none">
          <path d="M 0 75 L 300 75 M 150 0 L 150 150" stroke="#18181b" strokeWidth="1" />
          <circle cx={target.x} cy={target.y} r="17" fill="none" stroke={aligned ? '#22c55e' : '#52525b'} strokeWidth="2" strokeDasharray="4 5" />
          <circle cx={target.x} cy={target.y} r="3" fill={aligned ? '#22c55e' : '#71717a'} />

          <g transform={`translate(${point.x} ${point.y})`}>
            <polyline
              points={stars.map((star) => `${star.x},${star.y}`).join(' ')}
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
            />
            {stars.map((star) => (
              <circle key={`${star.x}-${star.y}`} cx={star.x} cy={star.y} r="5" fill="#f472b6" filter="drop-shadow(0 0 6px rgba(244,114,182,0.9))" />
            ))}
          </g>
        </svg>

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-400/60 bg-pink-500/20 active:bg-pink-500/40 transition-colors touch-none"
          style={{ left: `${(point.x / 300) * 100}%`, top: `${(point.y / 150) * 100}%` }}
          aria-label="Arrastar constelação"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 text-center text-xs">
        <div className={`border rounded-lg p-3 ${aligned ? 'border-green-500/40 text-green-400' : 'border-zinc-800 text-zinc-500'}`}>
          Sua metade
        </div>
        <div className={`border rounded-lg p-3 ${partnerAligned ? 'border-green-500/40 text-green-400' : 'border-zinc-800 text-zinc-500'}`}>
          Outra metade
        </div>
      </div>

      <button
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        disabled={!aligned || !partnerAligned || result === 'success'}
        className="w-full bg-pink-600 disabled:bg-zinc-800 disabled:text-zinc-500 hover:bg-pink-500 text-white font-semibold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Hand className="w-4 h-4" />
        {result === 'charging' ? 'Mantendo sincronização...' : 'Segurar Sincronizar'}
      </button>

      {(result === 'charging' || result === 'success') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-5 border p-4 rounded-xl text-center flex items-center justify-center gap-2 ${
            result === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-pink-500/10 border-pink-500/30 text-pink-300'
          }`}
        >
          {result === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {result === 'success' ? 'Merge concluído. Memorial desbloqueado.' : 'Segurem juntos mais um instante.'}
        </motion.div>
      )}
    </div>
  );
};

export default Puzzle7;
