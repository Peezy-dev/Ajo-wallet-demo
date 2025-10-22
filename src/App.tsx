import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";

import Login from "./Pages/Login";
import useSession from "./useSession";
import AjoGroupPage from "./AjoGroup";

function App() {
  const session = useSession();
  return (
    <Router>
      <div className="bg-black text-white min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/Login"
            element={session ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/dashboard"
            element={session ? <Dashboard /> : <Navigate to="/Login" />}
          />
          <Route
            path="/ajo-group"
            element={session ? <AjoGroupPage /> : <Navigate to="/dashboard" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
