import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, SlidersHorizontal, CheckCircle2, Radio } from 'lucide-react';
import { useRealtime } from '../../context/useRealtime';
import { getPuzzle5Config } from '../../lib/puzzleRandom';

type Signal = {
  frequency: number;
  amplitude: number;
  phase: number;
};

const isSignalSynced = (signal: Signal, target: Signal) =>
  Math.abs(signal.frequency - target.frequency) <= 0.05 &&
  Math.abs(signal.amplitude - target.amplitude) <= 0.05 &&
  Math.abs(signal.phase - target.phase) <= 0.05;

const makeWavePath = (signal: Signal, width = 300, height = 120) => {
  const points = Array.from({ length: 80 }, (_, index) => {
    const x = (index / 79) * width;
    const angle = (index / 79) * Math.PI * 2 * (signal.frequency / 3) + signal.phase / 4;
    const y = height / 2 + Math.sin(angle) * signal.amplitude * 6;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `M ${points.join(' L ')}`;
};

const Puzzle5 = () => {
  const { isHost, appState, broadcastEvent, updateAppState, channel } = useRealtime();
  const config = getPuzzle5Config(appState.gameSeed);
  const [signal, setSignal] = useState<Signal>(config.initial);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!channel) return;
    let active = true;

    channel.on('broadcast', { event: 'signal_update' }, (payload) => {
      if (active && payload.payload) {
        setSignal({
          frequency: payload.payload.frequency,
          amplitude: payload.payload.amplitude,
          phase: payload.payload.phase,
        });
      }
    });

    return () => {
      active = false;
    };
  }, [channel]);

  const targetPath = useMemo(() => makeWavePath(config.target), [config.target]);
  const currentPath = useMemo(() => makeWavePath(signal), [signal]);
  const synced = isSignalSynced(signal, config.target);

  const updateSignal = (key: keyof Signal, value: number) => {
    const roundedValue = Number(value.toFixed(1));
    const nextSignal = { ...signal, [key]: roundedValue };
    setSignal(nextSignal);
    broadcastEvent('signal_update', nextSignal);
  };

  const handleLock = () => {
    if (!synced) return;
    setShowSuccess(true);
    broadcastEvent('signal_solved', {});
    setTimeout(() => updateAppState({ currentPuzzle: 6 }), 1600);
  };

  useEffect(() => {
    if (!channel) return;
    let active = true;

    channel.on('broadcast', { event: 'signal_solved' }, () => {
      if (!active) return;
      setShowSuccess(true);
      setTimeout(() => updateAppState({ currentPuzzle: 6 }), 1600);
    });

    return () => {
      active = false;
    };
  }, [channel, updateAppState]);

  return (
    <div className="w-full h-full flex flex-col p-6 font-mono min-h-[560px]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
        {isHost ? <SlidersHorizontal className="text-zinc-500 w-5 h-5" /> : <Activity className="text-zinc-500 w-5 h-5" />}
        <span className="text-xs text-zinc-500 uppercase tracking-widest">
          {isHost ? 'Luca' : 'Mimi'} // Sincronização de Frequência
        </span>
      </div>

      <p className="text-sm text-zinc-400 text-center leading-relaxed mb-6">
        {isHost
          ? 'Ajuste os três canais. A Mimi enxerga a onda alvo e precisa guiar cada movimento.'
          : 'Compare a linha rosa com o alvo verde e guie o Luca até a sobreposição perfeita.'}
      </p>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-zinc-500">OSCILOSCÓPIO</span>
          <span className={`text-xs ${synced ? 'text-green-400' : 'text-pink-400'}`}>
            {synced ? 'LOCK' : 'TRACKING'}
          </span>
        </div>
        <svg viewBox="0 0 300 120" className="w-full h-36 bg-black rounded-lg border border-zinc-900">
          <path d="M 0,60 L 300,60" stroke="#27272a" strokeWidth="1" />
          <path d={targetPath} fill="none" stroke={isHost ? '#3f3f46' : '#22c55e'} strokeWidth="3" strokeDasharray="5 5" />
          <motion.path
            d={currentPath}
            fill="none"
            stroke="#ec4899"
            strokeWidth="3"
            filter="drop-shadow(0 0 6px rgba(236,72,153,0.8))"
          />
        </svg>
      </div>

      {isHost ? (
        <div className="space-y-5">
          {([
            ['frequency', 'Frequência'],
            ['amplitude', 'Amplitude'],
            ['phase', 'Fase'],
          ] as const).map(([key, label]) => (
            <div key={key} className="block">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-400">{label}</span>
                <span className="text-pink-400 font-bold">canal oculto</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSignal(key, signal[key] - (key === 'phase' ? 0.5 : 0.2))}
                  className="flex-1 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-bold py-3 rounded-lg active:scale-95 transition-transform"
                >
                  -
                </button>
                <button
                  onClick={() => updateSignal(key, signal[key] + (key === 'phase' ? 0.5 : 0.2))}
                  className="flex-1 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white font-bold py-3 rounded-lg active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleLock}
            disabled={!synced}
            className="w-full bg-pink-600 disabled:bg-zinc-800 disabled:text-zinc-500 hover:bg-pink-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Radio className="w-4 h-4" />
            Travar Frequência
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 text-center">
          {([
            ['FREQ', signal.frequency, config.target.frequency],
            ['AMP', signal.amplitude, config.target.amplitude],
            ['FASE', signal.phase, config.target.phase],
          ] as const).map(([label, value, target]) => (
            <div key={label} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
              <p className="text-[10px] text-zinc-500 mb-1">{label}</p>
              <p className={Math.abs(value - target) <= 0.05 ? 'text-green-400 font-bold' : 'text-pink-400 font-bold'}>
                {Math.abs(value - target) <= 0.05 ? 'OK' : value < target ? 'SUBIR' : 'DESCER'}
              </p>
            </div>
          ))}
        </div>
      )}

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-5 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-center flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Frequência sincronizada.
        </motion.div>
      )}
    </div>
  );
};

export default Puzzle5;
