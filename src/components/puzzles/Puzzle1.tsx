import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Lock, KeyRound, AlertTriangle, ScanSearch, FileDigit } from 'lucide-react';
import { useRealtime } from '../../context/useRealtime';
import { getPuzzle1Config } from '../../lib/puzzleRandom';

const Puzzle1 = () => {
  const { isHost, appState, updateAppState } = useRealtime();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Beta Node State
  const [isScanning, setIsScanning] = useState(false);
  const [foundFragments, setFoundFragments] = useState<number[]>([]);
  const { key, fragments } = getPuzzle1Config(appState.gameSeed);
  const totalFragments = fragments.length;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === key) {
      updateAppState({ currentPuzzle: 2 });
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
      setPassword('');
    }
  };

  const handleFragmentClick = (id: number) => {
    if (!foundFragments.includes(id)) {
      setFoundFragments([...foundFragments, id]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-mono relative min-h-[500px]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800"
      >
        <Terminal className="text-zinc-500 w-5 h-5" />
        <span className="text-xs text-zinc-500 uppercase tracking-widest">
          {isHost ? 'Luca' : 'Mimi'} // Boot Sequence
        </span>
      </motion.div>

      {isHost ? (
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-6">
            <div className="flex items-center gap-2 mb-2 text-pink-400">
              <Lock className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Acesso Restrito</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Sistema bloqueado. É necessária a chave de acesso para prosseguir. Aguardando decodificação da Mimi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value.toUpperCase())}
                placeholder="Insira a chave..."
                maxLength={30}
                className={`w-full bg-zinc-950 border ${error ? 'border-red-500' : 'border-zinc-700'} text-zinc-50 py-3 px-4 rounded-lg focus:outline-none focus:border-pink-500 transition-colors tracking-widest text-center text-xl`}
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              Desbloquear
            </button>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-400 text-xs text-center mt-2"
              >
                Acesso Negado. Chave incorreta.
              </motion.p>
            )}
          </form>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col h-full relative"
        >
          {!isScanning ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="text-yellow-500 w-12 h-12 mb-4 animate-pulse" />
              <p className="text-sm text-zinc-400 mb-6">
                Chave de acesso fragmentada. O Luca está bloqueado.
                É necessário escanear a rede para recuperar os pacotes de dados perdidos.
              </p>
              <button 
                onClick={() => setIsScanning(true)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-lg flex items-center gap-2 border border-zinc-700"
              >
                <ScanSearch className="w-5 h-5" />
                Iniciar Varredura
              </button>
            </div>
          ) : (
            <div className="flex-1 border border-zinc-800 rounded-xl bg-zinc-950 relative overflow-hidden">
              <div className="absolute inset-0 scanner-grid opacity-20 pointer-events-none"></div>
              
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <span className="text-xs text-zinc-500">Varrendo frequências...</span>
                <span className="text-xs font-bold text-pink-400">
                  {foundFragments.length} / {totalFragments} pacotes
                </span>
              </div>

              {/* The Scanning Area */}
              <div className="relative flex-1 min-h-[300px]">
                <AnimatePresence>
                  {fragments.map((frag) => (
                    !foundFragments.includes(frag.id) && (
                      <motion.button
                        key={frag.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0.3, 1, 0.3], 
                          scale: 1,
                        }}
                        transition={{ 
                          opacity: { repeat: Infinity, duration: 2, delay: frag.id * 0.5 },
                        }}
                        exit={{ opacity: 0, scale: 2 }}
                        onClick={() => handleFragmentClick(frag.id)}
                        className="absolute w-8 h-8 rounded-full border border-pink-500/50 flex items-center justify-center bg-pink-500/10 cursor-pointer"
                        style={frag.pos}
                      >
                        <FileDigit className="w-4 h-4 text-pink-400" />
                      </motion.button>
                    )
                  ))}
                </AnimatePresence>
                
                {foundFragments.length === totalFragments && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4"
                  >
                    <div className="text-center">
                      <p className="text-green-400 mb-2 text-sm">Pacotes decodificados com sucesso!</p>
                      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-1">MENSAGEM RECONSTRUÍDA:</p>
                        <p className="text-lg text-zinc-100 font-bold">
                          Chave: <span className="text-pink-400 tracking-widest">{key}</span>
                        </p>
                      </div>
                      <p className="text-xs text-zinc-500 mt-4">Transmita a chave para o Luca.</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Puzzle1;
