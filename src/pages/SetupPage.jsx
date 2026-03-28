import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function SetupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await base44.entities.BabyProfile.create({
        name,
        date_of_birth: dob,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError("Failed to save profile. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👶</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Set up your baby's profile
          </h1>
          <p className="text-gray-500 text-sm">
            So we can give age-appropriate advice
          </p>
        </div>

        <label className="block mb-4">
          <span className="text-sm font-semibold text-gray-700">
            Baby's name
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maya"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm font-semibold text-gray-700">
            Date of birth
          </span>
          <input
            type="date"
            required
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </label>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save & Continue"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="w-full mt-3 rounded-lg bg-gray-100 px-4 py-3 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
        >
          Skip — just check for myself
        </button>
      </form>
    </div>
  );
}
