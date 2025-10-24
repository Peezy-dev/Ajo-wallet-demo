import { useEffect, useState } from "react";
import { supabase } from "..//src/Lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
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
