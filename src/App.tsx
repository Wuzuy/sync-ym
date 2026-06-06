import { Routes, Route, Navigate } from 'react-router-dom';
import { useRealtime } from './context/useRealtime';
import Home from './pages/Home';
import Puzzles from './pages/Puzzles';
import Memorial from './pages/Memorial';

function App() {
  const { sessionId, appState } = useRealtime();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-start sm:items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-zinc-900 shadow-2xl rounded-2xl overflow-hidden border border-zinc-800">
        <Routes>
          {/* If no session, show Home (Pairing) */}
          <Route path="/" element={!sessionId ? <Home /> : <Navigate to="/puzzles" />} />
          
          {/* If session exists, show puzzles, otherwise back to home */}
          <Route path="/puzzles" element={sessionId ? <Puzzles /> : <Navigate to="/" />} />
          
          {/* Final memorial screen */}
          <Route path="/memorial" element={sessionId && appState.isMemorialUnlocked ? <Memorial /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
