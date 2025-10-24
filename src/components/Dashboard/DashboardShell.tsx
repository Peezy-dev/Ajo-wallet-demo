import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { supabase } from "../../Lib/supabaseClient";
import { Navigate } from "react-router-dom";

interface Wallet {
  balance: number;
  total_contributed: number;
  total_withdrawn: number;
  next_payout: string | null;
}

export default function DashboardShell() {
  const [wallet, setWallet] = useState<Wallet>({
    balance: 0,
    total_contributed: 0,
    total_withdrawn: 0,
    next_payout: null,
  });

  const [user, setUser] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // ✅ Fetch user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();
  }, []);
  // ✅ Fetch wallet for logged-in user
  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching wallet:", error);
        return;
      }

      if (data) {
        setWallet({
          balance: Number(data.balance) || 0,
          total_contributed: Number(data.total_contributed) || 0,
          total_withdrawn: Number(data.total_withdrawn) || 0,
          next_payout: data.next_payout || null,
        });
      }
    };

    fetchWallet();
  }, [user]);

  // ✅ Handle Funding
  const handleFund = async () => {
    const amt = Number(fundAmount);
    if (!amt || amt <= 0) return alert("Enter a valid amount");

    const newBalance = wallet.balance + amt;
    const newContributed = wallet.total_contributed + amt;

    const { error } = await supabase
      .from("wallets")
      .update({
        balance: newBalance,
        total_contributed: newContributed,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Fund error:", error);
      return alert("Error funding wallet");
    }

    setWallet({
      ...wallet,
      balance: newBalance,
      total_contributed: newContributed,
    });

    alert(`Successfully funded ₦${amt.toLocaleString()}`);
    setFundAmount("");
  };

  // ✅ Handle Withdraw
  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) return alert("Enter a valid amount");

    if (amt > wallet.balance) return alert("Insufficient balance");

    const newBalance = wallet.balance - amt;
    const newWithdrawn = wallet.total_withdrawn + amt;

    const { error } = await supabase
      .from("wallets")
      .update({
        balance: newBalance,
        total_withdrawn: newWithdrawn,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Withdraw error:", error);
      return alert("Error withdrawing funds");
    }

    setWallet({
      ...wallet,
      balance: newBalance,
      total_withdrawn: newWithdrawn,
    });

    alert(`Successfully withdrew ₦${amt.toLocaleString()}`);
    setWithdrawAmount("");
  };
  // ✅ Auto-generate next payout date on load
  useEffect(() => {
    if (!wallet.next_payout) {
      const nextPayout = new Date();
      nextPayout.setDate(nextPayout.getDate() + 7);
      setWallet((prev) => ({
        ...prev,
        next_payout: nextPayout.toISOString(),
      }));
    }
  }, [wallet.next_payout]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      alert("Error logging out");
      return;
    }
    <Navigate to="/Login" />;
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-4 p-6 bg-white shadow-lg rounded-2xl max-w-md mx-auto mt-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-bold text-gray-800">Wallet Dashboard</h2>

      <div className="text-center space-y-2">
        <p>Balance: ₦{wallet.balance.toLocaleString()}</p>
        <p>Contributed: ₦{wallet.total_contributed.toLocaleString()}</p>
        <p>
          Next Payout:{" "}
          {wallet.next_payout
            ? new Date(wallet.next_payout).toDateString()
            : "Not set"}
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-4 w-full">
        <input
          type="number"
          placeholder="Enter amount to fund"
          value={fundAmount}
          onChange={(e) => setFundAmount(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleFund}
          className="bg-green-500 text-white p-2 rounded-lg"
        >
          Fund Wallet
        </button>

        <input
          type="number"
          placeholder="Enter amount to withdraw"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="border p-2 rounded w-full mt-3"
        />
        <button
          onClick={handleWithdraw}
          className="bg-red-500 text-white p-2 rounded-lg"
        >
          Withdraw
        </button>
      </div>

      <button
        onClick={() => (window.location.href = "/ajo-group")}
        className="bg-blue-600 text-white p-2 rounded-lg mt-4 w-full"
      >
        Go to Ajo Groups
      </button>
      <button
        onClick={handleLogout}
        className="bg-blue-600 text-white p-2 rounded-lg mt-4 w-full"
      >
        Logout
      </button>
    </motion.div>
  );
}
