import { motion } from 'framer-motion';

const Memorial = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="p-8 min-h-[500px] flex flex-col items-center text-center overflow-y-auto"
    >
      <h1 className="text-3xl font-bold text-pink-400 mb-6 tracking-widest uppercase">
        Conexão Estabelecida
      </h1>
      
      <div className="space-y-4 text-zinc-300 text-sm leading-relaxed max-w-sm mx-auto">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800 w-full">
        <p className="text-xs text-zinc-500 font-mono">
          System Status: 100% Synced
        </p>
      </div>
    </motion.div>
  );
};

export default Memorial;
