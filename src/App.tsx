import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";

import Login from "./Pages/Login";
import type { Session } from "@supabase/supabase-js";
import AjoGroupPage from "./AjoGroup";
import { useState, useEffect } from "react";
import { supabase } from "../src/Lib/supabaseClient";
import GroupDetails from "./Pages/GroupDetails";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <p>Loading ...</p>;
  }

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
          <Route
            path="/group/:id"
            element={session ? <GroupDetails /> : <Navigate to="/ajo-group" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
