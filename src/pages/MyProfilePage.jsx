import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function MyProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.UserProfile.list(null, 1).then((profiles) => {
      if (profiles.length > 0) {
        const p = profiles[0];
        setName(p.name || "");
        setGender(p.gender || "");
        setIsPregnant(p.is_pregnant || false);
        setExistingId(p.id);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = {
        name,
        gender,
        is_pregnant: gender === "female" ? isPregnant : false,
      };
      if (existingId) {
        await base44.entities.UserProfile.update(existingId, data);
      } else {
        await base44.entities.UserProfile.create(data);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError("Failed to save profile. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧑</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {existingId ? "Edit your profile" : "Set up your profile"}
          </h1>
          <p className="text-gray-500 text-sm">
            So we can give you personalized advice
          </p>
        </div>

        <label className="block mb-4">
          <span className="text-sm font-semibold text-gray-700">
            Your name
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tom"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </label>

        <fieldset className="mb-4">
          <legend className="text-sm font-semibold text-gray-700 mb-2">
            Gender
          </legend>
          <div className="flex gap-2">
            {[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
              { value: "other", label: "Other" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setGender(opt.value);
                  if (opt.value !== "female") setIsPregnant(false);
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  gender === opt.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {gender === "female" && (
          <label className="flex items-center gap-3 mb-6 px-1 cursor-pointer">
            <input
              type="checkbox"
              checked={isPregnant}
              onChange={(e) => setIsPregnant(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              I'm currently pregnant
            </span>
          </label>
        )}

        {gender !== "female" && <div className="mb-6" />}

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving || !gender}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save & Continue"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="w-full mt-3 rounded-lg bg-gray-100 px-4 py-3 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
