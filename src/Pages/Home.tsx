import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/logo";
const Home = () => {
  const nav = useNavigate();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full">
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo />
          <h1 className="text-3xl font-semibold">
            AJO - Your Personal Finance Companion
          </h1>
          <p className="muted">Fast. Simple. Secure.</p>
          <div className="mt-6 w-full">
            {/* Replace with real authentication later */}

            <button
              onClick={() => nav("/Login")}
              className="w-6 py-3 rounded-lg border border-white text-white hover:opacity-90"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
export default Home;
