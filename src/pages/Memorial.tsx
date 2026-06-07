import { motion } from "framer-motion";

const Memorial = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="p-8 min-h-125 flex flex-col items-center text-center overflow-y-auto"
    >
      <h1 className="text-3xl font-bold text-pink-400 mb-6 tracking-widest uppercase">
        Conexão Estabelecida
      </h1>

      <div className="space-y-4 text-zinc-300 text-sm leading-relaxed max-w-sm mx-auto">
        <p>
          Com mentes sincronizadas e corações embarcados, Luca gostaria de dizer
          que tem a certeza do sentimento que os une, de uma conexão que
          gostaria de compartilhar:
        </p>
        <p>
          Certamente, um dia faltando para de completarem um mês que se
          conhecem, Luca gostaria de reforçar o quanto gosta muito de Mimi. Pode
          não ser o primeiro dia dos namorados que poderão comemorar como
          namorados, mas é o primeiro dia dos namorados que poderão comemorar
          juntos, e isso é o que importa, afinal. Estarem juntos não é o detalhe
          mais importante?
        </p>
        <p>
          Obs: É o primeiro sem namorarmos, mas com certeza o próximo estaremos
          namorando rs
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800 w-full">
        <p className="text-shadow-xs text-zinc-500 font-mono">
          Mas se tu me cativas, nós teremos necessidade um do outro.
        </p>
      </div>
    </motion.div>
  );
};

export default Memorial;
