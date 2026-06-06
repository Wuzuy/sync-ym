import { useState, type FormEvent } from 'react';
import { useRealtime } from '../context/useRealtime';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, HeartHandshake, LogIn } from 'lucide-react';

const Home = () => {
  const { createSession, joinSession, error, setError } = useRealtime();
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error || localError;

  const handleCreate = async () => {
    setIsLoading(true);
    setLocalError(null);
    setError(null);
    try {
      const code = await createSession();
      setCreatedCode(code);
      setMode('create');
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Erro ao criar sessão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setIsLoading(true);
    setLocalError(null);
    setError(null);
    try {
      await joinSession(joinCode.trim());
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Erro ao conectar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-100 flex flex-col items-center justify-center relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full"
      >
        <div className="mx-auto bg-zinc-800/50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6 border border-zinc-700">
          <Terminal className="text-pink-400 w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Sync Protocol</h1>
        <p className="text-zinc-400 text-sm mb-8">Establish a secure connection with your partner.</p>

        <AnimatePresence>
          {displayError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-950/50 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg mb-6"
            >
              {displayError}
            </motion.div>
          )}
        </AnimatePresence>

        {mode === 'select' && (
          <div className="space-y-4">
            <button 
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <HeartHandshake className="w-5 h-5" />
              {isLoading ? 'Inicializando...' : 'Acessar como Luca'}
            </button>
            
            <button 
              onClick={() => {
                setMode('join');
                setLocalError(null);
                setError(null);
              }}
              className="w-full bg-zinc-800 text-zinc-50 hover:bg-zinc-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-zinc-700"
            >
              <LogIn className="w-5 h-5" />
              Acessar como Mimi
            </button>
          </div>
        )}

        {mode === 'create' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 shadow-inner">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-mono">Connection Code</p>
              <p className="text-4xl font-mono font-bold text-pink-400 tracking-widest">{createdCode}</p>
            </div>
            <p className="text-sm text-zinc-400">
              Envie este código para a Mimi. Aguardando conexão...
            </p>
            <div className="flex justify-center mt-4">
               <div className="flex space-x-2">
                 <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2 h-2 bg-pink-500 rounded-full"></motion.div>
                 <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 bg-pink-500 rounded-full"></motion.div>
                 <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 bg-pink-500 rounded-full"></motion.div>
               </div>
            </div>
            <button 
              onClick={() => setMode('select')}
              className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors mt-8"
            >
              Cancelar
            </button>
          </motion.div>
        )}

        {mode === 'join' && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ex: A1B2"
                  maxLength={4}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-50 text-center text-2xl tracking-widest font-mono py-4 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-inner uppercase"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading || joinCode.length < 4}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Conectando...' : 'Conectar'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setMode('select');
                  setLocalError(null);
                  setError(null);
                }}
                className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors mt-4"
              >
                Voltar
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
