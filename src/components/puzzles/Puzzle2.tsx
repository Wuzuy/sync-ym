import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRealtime } from '../../context/useRealtime';
import { getPuzzle2Config } from '../../lib/puzzleRandom';

const Puzzle2 = () => {
  const { isHost, appState, updateAppState } = useRealtime();
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState(false);
  const config = getPuzzle2Config(appState.gameSeed);

  const isMySideReady = isHost ? appState.p2AlphaReady : appState.p2BetaReady;
  const isPartnerReady = isHost ? appState.p2BetaReady : appState.p2AlphaReady;

  useEffect(() => {
    // If both are ready, advance to Puzzle 3 (handled by the one who sets the last ready state)
    if (appState.p2AlphaReady && appState.p2BetaReady && isHost) {
      setTimeout(() => {
        updateAppState({ currentPuzzle: 3 });
      }, 3000); // 3 second delay to show success message to both before advancing
    }
  }, [appState.p2AlphaReady, appState.p2BetaReady, isHost, updateAppState]);

  const handleRunCode = () => {
    const cleanInput = inputValue.trim();
    
    if (isHost) {
      if (cleanInput === String(config.lucaExpected)) {
        updateAppState({ p2AlphaReady: true });
        setLocalError(false);
      } else {
        triggerError();
      }
    } else {
      if (cleanInput === String(config.mimiExpected)) {
        updateAppState({ p2BetaReady: true });
        setLocalError(false);
      } else {
        triggerError();
      }
    }
  };

  const triggerError = () => {
    setLocalError(true);
    setTimeout(() => setLocalError(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-mono relative min-h-125">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800"
      >
        <div className="flex items-center gap-3">
          <Code2 className="text-zinc-500 w-5 h-5" />
          <span className="text-xs text-zinc-500 uppercase tracking-widest">
            {isHost ? 'Luca' : 'Mimi'} // Java Source Code
          </span>
        </div>
        
        {/* Status Indicators */}
        <div className="flex gap-2">
          <div className={`w-2 h-2 rounded-full ${appState.p2AlphaReady ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-zinc-700'}`} title="Luca Ready" />
          <div className={`w-2 h-2 rounded-full ${appState.p2BetaReady ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-zinc-700'}`} title="Mimi Ready" />
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
        <p className="text-sm text-zinc-400 mb-6 text-center leading-relaxed">
          Os códigos possuem dependências cruzadas. Conversem e analisem os métodos do parceiro para compilar.
        </p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#1e1e1e] p-4 rounded-xl border border-zinc-800 font-mono text-sm leading-loose shadow-xl overflow-x-auto relative"
        >
          {/* Editor Header */}
          <div className="flex gap-1.5 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>

          <div className="whitespace-nowrap text-[13px]">
            <span className="text-pink-400">import</span> <span className="text-blue-300">java.util.Love</span>;<br/><br/>
            
            {isHost ? (
              // Luca View (Heart.java)
              <>
                <span className="text-pink-400">public class</span> <span className="text-yellow-200">Heart</span> {'{'}<br/>
                &nbsp;&nbsp;<span className="text-pink-400">private final int</span> <span className="text-blue-300">connectionDate</span> = <span className="text-orange-300">{config.connectionDate}</span>;<br/>
                &nbsp;&nbsp;<span className="text-pink-400">private final int</span> <span className="text-blue-300">OFFSET</span> = <span className="text-orange-300">{config.heartOffset}</span>;<br/><br/>
                
                &nbsp;&nbsp;<span className="text-pink-400">public int</span> <span className="text-yellow-200">generateKeyForSoul</span>() {'{'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-500">{'// A chave da Mimi depende de constantes cruzadas'}</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> connectionDate + <span className="text-blue-300">Soul</span>.LUCKY_NUMBER + OFFSET;<br/>
                &nbsp;&nbsp;{'}'}<br/><br/>

                &nbsp;&nbsp;<span className="text-pink-400">public boolean</span> <span className="text-yellow-200">connect</span>(<span className="text-pink-400">int</span> <span className="text-blue-300">codeFromMimi</span>) {'{'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-500">{'// Aguardando resultado de'}</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-500">{'// Soul.getSyncCode()'}</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">int</span> expectedCode = <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isMySideReady}
                  placeholder="???"
                  maxLength={4}
                  className="bg-zinc-900 border-b border-zinc-500 focus:border-pink-500 outline-none text-orange-300 w-12 mx-1 px-1 text-center"
                />;<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> expectedCode == codeFromMimi;<br/>
                &nbsp;&nbsp;{'}'}<br/>
                {'}'}
              </>
            ) : (
              // Mimi View (Soul.java)
              <>
                <span className="text-pink-400">public class</span> <span className="text-yellow-200">Soul</span> {'{'}<br/>
                &nbsp;&nbsp;<span className="text-pink-400">public static final int</span> <span className="text-blue-300">LUCKY_NUMBER</span> = <span className="text-orange-300">{config.luckyNumber}</span>;<br/>
                &nbsp;&nbsp;<span className="text-pink-400">private static final int</span> <span className="text-blue-300">SYNC_FACTOR</span> = <span className="text-orange-300">{config.syncFactor}</span>;<br/><br/>
                
                &nbsp;&nbsp;<span className="text-pink-400">public int</span> <span className="text-yellow-200">getSyncCode</span>() {'{'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-500">{'// O código do Luca usa a nossa'}</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-500">{'// constante de sorte.'}</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> LUCKY_NUMBER * SYNC_FACTOR;<br/>
                &nbsp;&nbsp;{'}'}<br/><br/>

                &nbsp;&nbsp;<span className="text-pink-400">public boolean</span> <span className="text-yellow-200">connect</span>(<span className="text-pink-400">int</span> <span className="text-blue-300">codeFromHeart</span>) {'{'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-500">{'// Aguardando chave gerada por'}</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-500">{'// Heart.generateKeyForSoul()'}</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">int</span> expectedCode = <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isMySideReady}
                  placeholder="???"
                  maxLength={4}
                  className="bg-zinc-900 border-b border-zinc-500 focus:border-pink-500 outline-none text-orange-300 w-12 mx-1 px-1 text-center"
                />;<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-400">return</span> expectedCode == codeFromHeart;<br/>
                &nbsp;&nbsp;{'}'}<br/>
                {'}'}
              </>
            )}
          </div>
        </motion.div>

        <div className="mt-8">
          {!isMySideReady ? (
            <div className="space-y-3">
               <button 
                onClick={handleRunCode}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Compilar Código
              </button>
              
              {localError && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex items-center justify-center gap-2 text-red-400 text-xs mt-2"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Compilation Error: Valor incorreto.</span>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-center flex flex-col items-center gap-2"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-sm font-semibold">Compilado com Sucesso</span>
              
              {!isPartnerReady ? (
                <span className="text-xs text-green-500/70 mt-1 block">Aguardando o Node {isHost ? 'Mimi' : 'Luca'} compilar...</span>
              ) : (
                <span className="text-xs text-green-500/90 mt-1 block font-bold">Sync Completo! Avançando...</span>
              )}
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Puzzle2;
