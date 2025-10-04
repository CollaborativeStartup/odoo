import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth Pages
import Login from "./Pages/Auth/Login";
import SignUp from "./Pages/Auth/Signup";

// Admin Pages
import Layout from "./Pages/Admin/Layout";
import Dashboard from "./Pages/Admin/Dashboard";
import SetRules from "./Pages/Admin/SetRules";


function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="set-rules" element={<SetRules />} />
        </Route>



   
      </Routes>
    </Router>
  );
}

export default App;
