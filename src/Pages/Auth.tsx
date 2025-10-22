import React, { useState } from "react";
import { supabase } from "../Lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setisLogin] = useState(true);
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      nav("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md border border-white/10 p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Login" : "Create Account"}
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-2 rounded mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black border border-white/20 p-3 rounded-lg text-white placeholder-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black border border-white/20 p-3 rounded-lg text-white placeholder-gray-400"
            required
          />
          <button
            type="submit"
            disabled={Loading}
            className="bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition"
          >
            {Loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-400">
          {isLogin ? "No account yet?" : "Already have an account?"}{" "}
          <button
            onClick={() => setisLogin(!isLogin)}
            className="text-accent hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};
export default Auth;
