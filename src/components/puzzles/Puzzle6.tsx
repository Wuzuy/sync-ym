import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Cable, CheckCircle2, Scissors, TriangleAlert, Zap } from 'lucide-react';
import { useRealtime } from '../../context/useRealtime';
import { getPuzzle6Config } from '../../lib/puzzleRandom';

type Step = 'wire' | 'button' | 'done';

const Puzzle6 = () => {
  const { isHost, appState, broadcastEvent, updateAppState, channel } = useRealtime();
  const config = getPuzzle6Config(appState.gameSeed, appState.p6Attempt);
  const [stepState, setStepState] = useState<{ attempt: number; step: Step }>({ attempt: appState.p6Attempt, step: 'wire' });
  const [error, setError] = useState(false);
  const step = stepState.attempt === appState.p6Attempt ? stepState.step : 'wire';

  useEffect(() => {
    if (!channel) return;
    let active = true;

    channel.on('broadcast', { event: 'manual_panel_step' }, (payload) => {
      if (!active) return;
      if (payload.payload?.step) {
        setStepState({ attempt: appState.p6Attempt, step: payload.payload.step });
      }
      if (payload.payload?.error) {
        setError(true);
        setTimeout(() => setError(false), 700);
      }
    });

    return () => {
      active = false;
    };
  }, [appState.p6Attempt, channel]);

  const fail = () => {
    const nextAttempt = appState.p6Attempt + 1;
    setStepState({ attempt: nextAttempt, step: 'wire' });
    setError(true);
    updateAppState({ p6Attempt: nextAttempt });
    broadcastEvent('manual_panel_step', { step: 'wire', error: true });
    setTimeout(() => setError(false), 700);
  };

  const cutWire = (color: string) => {
    if (!isHost || step !== 'wire') return;
    if (color === config.requiredWire) {
      setStepState({ attempt: appState.p6Attempt, step: 'button' });
      broadcastEvent('manual_panel_step', { step: 'button' });
      return;
    }
    fail();
  };

  const pressButton = (color: string) => {
    if (!isHost || step !== 'button') return;
    if (color === config.requiredButton) {
      setStepState({ attempt: appState.p6Attempt, step: 'done' });
      broadcastEvent('manual_panel_step', { step: 'done' });
      setTimeout(() => updateAppState({ currentPuzzle: 7 }), 1600);
      return;
    }
    fail();
  };

  useEffect(() => {
    if (step === 'done') {
      const timeout = setTimeout(() => updateAppState({ currentPuzzle: 7 }), 1700);
      return () => clearTimeout(timeout);
    }
  }, [step, updateAppState]);

  const wireClasses: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    pink: 'bg-pink-500',
  };

  const buttonClasses: Record<string, string> = {
    yellow: 'bg-yellow-500 text-zinc-950',
    red: 'bg-red-600 text-white',
    blue: 'bg-blue-600 text-white',
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-mono min-h-140">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
        {isHost ? <Zap className="text-zinc-500 w-5 h-5" /> : <BookOpen className="text-zinc-500 w-5 h-5" />}
        <span className="text-xs text-zinc-500 uppercase tracking-widest">
          {isHost ? 'Luca' : 'Mimi'} // Manual de Instruções
        </span>
      </div>

      {isHost ? (
        <motion.div
          animate={error ? { x: [-8, 8, -8, 8, 0], borderColor: '#ef4444' } : { borderColor: '#3f3f46' }}
          className="bg-zinc-950 border rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-yellow-400">
              <TriangleAlert className="w-5 h-5" />
              <span className="text-sm font-bold">SERVIDOR EM FUSÃO</span>
            </div>
            <span className="text-xs text-zinc-500">{step === 'wire' ? 'ETAPA 1' : step === 'button' ? 'ETAPA 2' : 'ESTÁVEL'}</span>
          </div>

          <div className="mb-6">
            <p className="text-xs text-zinc-500 mb-3">FIOS</p>
            <div className="space-y-3">
              {config.wireColors.map((color) => (
                <button
                  key={color}
                  onClick={() => cutWire(color)}
                  disabled={step !== 'wire'}
                  className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-3 px-3 disabled:opacity-50"
                >
                  <Scissors className="w-4 h-4 text-zinc-500" />
                  <span className={`h-2 flex-1 rounded-full ${wireClasses[color]}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-3">
            {config.buttonColors.map((color) => (
              <button
                key={color}
                onClick={() => pressButton(color)}
                disabled={step !== 'button'}
                className={`${buttonClasses[color]} py-4 rounded-lg font-bold disabled:opacity-40`}
              >
                {color.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-2">SÍMBOLOS DETECTADOS</p>
            <div className="flex gap-3 text-lg">
              {config.symbols.map((symbol) => (
                <span key={symbol}>{symbol}</span>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-pink-400 mb-5">
            <Cable className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase">Manual do Sistema</h2>
          </div>

          <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-2">REGRA DOS FIOS</p>
              <p>
                Se o painel mostrar {config.symbols.join(', ')}, corte o fio {config.requiredWire.toUpperCase()}.
              </p>
            </div>
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-2">REGRA DOS BOTÕES</p>
              <p>Depois do fio correto, pressione o botão {config.requiredButton.toUpperCase()}.</p>
            </div>
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-zinc-500 mb-2">STATUS</p>
              <p className={step === 'done' ? 'text-green-400' : 'text-pink-400'}>
                {step === 'wire' ? 'Aguardando corte do fio.' : step === 'button' ? 'Fio correto. Aguardando botão.' : 'Servidor estabilizado.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 'done' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-5 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-center flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          Painel estabilizado.
        </motion.div>
      )}
    </div>
  );
};

export default Puzzle6;
