import { Route, Routes } from "react-router-dom";
import Login from "./pages/login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
