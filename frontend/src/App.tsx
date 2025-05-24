import { Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import { Register } from "./pages/register";
import { VerifyEmail } from "./pages/verifyEmail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/email/verify/:code" element={<VerifyEmail />} />
    </Routes>
  );
}

export default App;
