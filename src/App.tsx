import "./App.css";
import FrontPage from "./components/FrontPage";
import VoiceOrbInterface from "./components/VoiceOrb";

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <FrontPage />
        <VoiceOrbInterface />
      </div>
    </>
  );
}

export default App;
