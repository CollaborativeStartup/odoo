import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "../Pages/Auth/Login";
import SignUp from "../Pages/Auth/Signup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
