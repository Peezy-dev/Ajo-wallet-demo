import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../Lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((session) => {
      if (session) {
        navigate("/dashboard");
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="bg-neutral-900 p-6 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">AJO LOGIN</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
          theme="dark"
        />
      </div>
    </div>
  );
};
export default Login;
