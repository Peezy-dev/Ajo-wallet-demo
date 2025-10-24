import { useEffect, useState } from "react";
import { supabase } from "../src/Lib/supabaseClient";
import { Navigate, useNavigate } from "react-router-dom";

interface AjoGroup {
  id: string;
  name: string;
  description: string;
  contribution_amount: number;
  created_at: string;
}

export default function AjoGroupPage() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<AjoGroup[]>([]);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [kycVerified, setKycVerified] = useState(false);

  const navigate = useNavigate(); // 👈 initialize navigation

  // ✅ Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    fetchUser();
  }, []);

  // ✅ Fetch wallet (for KYC status)
  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("wallets")
        .select("kyc_verified")
        .eq("user_id", user.id)
        .single();

      if (data) setKycVerified(data.kyc_verified);
    };
    fetchWallet();
  }, [user]);

  // ✅ Fetch all Ajo groups
  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase.from("ajo_groups").select("*");
      if (data) setGroups(data);
    };
    fetchGroups();
  }, []);

  // ✅ Create new group
  const handleCreateGroup = async () => {
    if (!groupName || !amount) return alert("Enter group name and amount");

    const { error } = await supabase.from("ajo_groups").insert([
      {
        name: groupName,
        description,
        contribution_amount: Number(amount),
        admin_id: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      return alert("Error creating group");
    }

    alert("Ajo Group Created Successfully ✅");
    setGroupName("");
    setDescription("");
    setAmount("");

    // Refresh list
    const { data } = await supabase.from("ajo_groups").select("*");
    setGroups(data || []);
  };

  // ✅ Toggle KYC verification (Admin only)
  const toggleKYC = async () => {
    const newStatus = !kycVerified;
    const { error } = await supabase
      .from("wallets")
      .update({ kyc_verified: newStatus })
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return alert("Error updating KYC");
    }

    setKycVerified(newStatus);
    alert(`KYC has been ${newStatus ? "verified ✅" : "unverified ❌"}`);
  };

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
    <div className="p-6 max-w-lg mx-auto mt-8 bg-white rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-center">Ajo Group Management</h2>

      {/* KYC Section */}
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-700 mb-2">
          KYC Status:{" "}
          <span
            className={`font-bold ${
              kycVerified ? "text-green-600" : "text-red-500"
            }`}
          >
            {kycVerified ? "Verified" : "Not Verified"}
          </span>
        </p>
        <button
          onClick={toggleKYC}
          className={`px-4 py-2 rounded-lg text-white ${
            kycVerified ? "bg-red-500" : "bg-green-600"
          }`}
        >
          {kycVerified ? "Revoke KYC" : "Verify KYC"}
        </button>
      </div>

      {/* Create Group */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Create Ajo Group</h3>
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="number"
          placeholder="Contribution Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <button
          onClick={handleCreateGroup}
          className="bg-blue-600 text-white w-full p-2 rounded-lg"
        >
          Create Group
        </button>
      </div>

      {/* Group List */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Existing Groups</h3>
        {groups.length === 0 ? (
          <p className="text-gray-500 text-center">No groups created yet</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((group) => (
              <li
                key={group.id}
                onClick={() => navigate(`/group/${group.id}`)} // 👈 redirect on click
                className="border p-3 rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
              >
                <p className="font-bold text-gray-800">{group.name}</p>
                <p className="text-sm text-gray-500">{group.description}</p>
                <p className="text-sm text-gray-600">
                  Contribution: ₦{group.contribution_amount.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="bg-blue-600 text-white p-2 rounded-lg mt-4 w-full"
      >
        Logout
      </button>
    </div>
  );
}
