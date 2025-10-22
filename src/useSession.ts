import { useEffect, useState } from "react";
import { supabase } from "..//src/Lib/supabaseClient";

const useSession = () => {
  const [session, setSession] = useState(() => supabase.auth.getSession());
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
  return session;
};
export default useSession;
