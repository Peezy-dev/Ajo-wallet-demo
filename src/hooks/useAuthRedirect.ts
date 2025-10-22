import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Lib/supabaseClient";

const useAuthRedirect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        navigate("/dashboard", { replace: true });
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [navigate]);
  return loading;
};
export default useAuthRedirect;
