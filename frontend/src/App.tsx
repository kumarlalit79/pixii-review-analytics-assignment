import { BrowserRouter, Routes, Route } from "react-router-dom";
import InputPage from "../pages/InputPage";
import LoadingPage from "../pages/LoadingPage";
import ResultsPage from "../pages/ResultsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InputPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;