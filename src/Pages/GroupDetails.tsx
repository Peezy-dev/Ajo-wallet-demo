import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../Lib/supabaseClient";

export default function GroupDetails() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [user, setUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    fetchUser();
  }, []);

  // ✅ Fetch group details
  useEffect(() => {
    const fetchGroup = async () => {
      const { data, error } = await supabase
        .from("ajo_groups")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error(error);
      else setGroup(data);
    };
    fetchGroup();
  }, [id]);

  // ✅ Check if user is already a member
  useEffect(() => {
    const checkMembership = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setIsMember(true);
      setLoading(false);
    };
    checkMembership();
  }, [user, id]);

  // ✅ Join group
  const handleJoinGroup = async () => {
    if (!user) return alert("Please log in first.");
    setLoading(true);

    const { error } = await supabase
      .from("group_members")
      .insert([{ group_id: id, user_id: user.id }]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("You’ve successfully joined this Ajo group 🎉");
    } else {
      alert("error joining group:");
      setIsMember(true);
    }
  };

  if (!group)
    return <p className="text-center mt-10">Loading group details...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto mt-8 bg-white rounded-2xl shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-center">{group.name}</h2>
      <p className="text-gray-600 text-center">{group.description}</p>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700">
          <strong>Contribution:</strong> ₦
          {group.contribution_amount.toLocaleString()}
        </p>
        <p className="text-gray-700">
          <strong>Created At:</strong>{" "}
          {new Date(group.created_at).toDateString()}
        </p>
      </div>

      {/* ✅ Join Button */}
      <div className="text-center mt-4">
        {isMember ? (
          <button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
          >
            ✅ You’ve joined this group
          </button>
        ) : (
          <button
            onClick={handleJoinGroup}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            {loading ? "Joining..." : "Join Group"}
          </button>
        )}
      </div>

      <button
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white w-full py-2 rounded-lg mt-4"
      >
        ← Back
      </button>
    </div>
  );
}
