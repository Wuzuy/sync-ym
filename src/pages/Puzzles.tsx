import { useRealtime } from '../context/useRealtime';
import Puzzle1 from '../components/puzzles/Puzzle1';
import Puzzle2 from '../components/puzzles/Puzzle2';
import Puzzle3 from '../components/puzzles/Puzzle3';
import Puzzle4 from '../components/puzzles/Puzzle4';
import Puzzle5 from '../components/puzzles/Puzzle5';
import Puzzle6 from '../components/puzzles/Puzzle6';
import Puzzle7 from '../components/puzzles/Puzzle7';

const Puzzles = () => {
  const { appState, updateAppState } = useRealtime();

  const renderPuzzle = () => {
    switch (appState.currentPuzzle) {
      case 1:
        return <Puzzle1 />;
      case 2:
        return <Puzzle2 />;
      case 3:
        return <Puzzle3 />;
      case 4:
        return <Puzzle4 />;
      case 5:
        return <Puzzle5 />;
      case 6:
        return <Puzzle6 />;
      case 7:
        return <Puzzle7 />;
      default:
        return (
          <div className="p-8 min-h-[400px] flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Puzzle {appState.currentPuzzle}</h1>
            <p className="text-zinc-400 mb-8">Esta tela será construída na próxima fase.</p>
            
            <button 
              onClick={() => updateAppState({ currentPuzzle: appState.currentPuzzle + 1 })}
              className="bg-zinc-800 py-2 px-4 rounded"
            >
              Avançar Puzzle (Dev Test)
            </button>

            {appState.currentPuzzle >= 7 && (
              <button 
                onClick={() => updateAppState({ isMemorialUnlocked: true })}
                className="bg-pink-600 mt-4 py-2 px-4 rounded"
              >
                Desbloquear Memorial
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full">
      {renderPuzzle()}
    </div>
  );
};

export default Puzzles;
