import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const TIME_CHIPS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "2 days ago", value: "2 days ago" },
  { label: "3 days ago", value: "3 days ago" },
];

export default function CheckPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [forBaby, setForBaby] = useState(false);
  const [foodText, setFoodText] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedChip, setSelectedChip] = useState(null);
  const [timeText, setTimeText] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.entities.BabyProfile.list(null, 1).then((profiles) => {
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForBaby(true);
      }
    });
    base44.entities.UserProfile.list(null, 1).then((profiles) => {
      if (profiles.length > 0) setUserProfile(profiles[0]);
    });
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChipClick = (value) => {
    setSelectedChip(value);
    setTimeText("");
  };

  const handleTimeTextChange = (value) => {
    setTimeText(value);
    setSelectedChip(null);
  };

  const getTimeDescription = () => {
    return selectedChip || timeText;
  };

  const handleSubmit = async () => {
    const timeDesc = getTimeDescription();
    if ((!foodText && !photoFile) || !timeDesc) return;

    setChecking(true);
    setError(null);

    try {
      let fileUrls = [];
      if (photoFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({
          file: photoFile,
        });
        fileUrls = [file_url];
      }

      const babyAge = profile
        ? Math.floor(
            (Date.now() - new Date(profile.date_of_birth).getTime()) /
              (1000 * 60 * 60 * 24 * 30.44)
          )
        : null;

      let eaterDescription;
      if (forBaby && profile) {
        eaterDescription = `a baby named ${profile.name}, who is ${babyAge} months old`;
      } else if (userProfile?.is_pregnant) {
        eaterDescription = `an adult who is currently pregnant`;
      } else {
        eaterDescription = "an adult";
      }

      const foodDescription = foodText
        ? `The food is: ${foodText}`
        : "Please identify the food from the attached image.";

      const prompt = `You are a food safety expert. A parent is asking whether leftover food is still safe to eat.

${foodDescription}

The food was made: ${timeDesc}.
Today's date is: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

The person who would eat this food is: ${eaterDescription}.

Analyze the food safety and respond with a JSON object. Be conservative — when in doubt, err on the side of caution, especially for babies, toddlers, and pregnant women. Consider:
- How long the food type typically stays safe when refrigerated
- Age-appropriate risks for babies/toddlers
- Pregnancy-specific risks (listeria, mercury, toxoplasmosis, etc.) if the eater is pregnant
- Common food safety guidelines from health authorities

Respond ONLY with the JSON object, no other text.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            safe: {
              type: "boolean",
              description: "Whether the food is safe to eat",
            },
            days_remaining: {
              type: "number",
              description:
                "Approximate number of days the food is still good for. 0 if not safe. null if unknown.",
            },
            explanation: {
              type: "string",
              description:
                "Clear explanation of why the food is or is not safe",
            },
            age_specific_notes: {
              type: "string",
              description:
                "Safety notes specific to the eater (baby age or adult). Empty string if not applicable.",
            },
            storage_tips: {
              type: "string",
              description: "Tips for storing this type of food",
            },
          },
        },
        file_urls: fileUrls.length > 0 ? fileUrls : undefined,
      });

      navigate("/result", { state: { result, forBaby, profile, userProfile } });
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setChecking(false);
    }
  };

  const canSubmit = (foodText || photoFile) && (selectedChip || timeText);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Can I Still Eat This?
          </h1>
          <p className="text-gray-500 text-sm">
            Check if food is safe to eat
          </p>
        </div>

        {/* Who's eating toggle */}
        {profile ? (
          <div className="flex bg-gray-200 rounded-lg p-1 mb-3">
            <button
              onClick={() => setForBaby(true)}
              className={`flex-1 text-center py-2 rounded-md text-sm font-semibold transition-colors ${
                forBaby
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500"
              }`}
            >
              🍼 For {profile.name}
            </button>
            <button
              onClick={() => setForBaby(false)}
              className={`flex-1 text-center py-2 rounded-md text-sm font-semibold transition-colors ${
                !forBaby
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500"
              }`}
            >
              🧑 For {userProfile?.name || "Me"}
            </button>
          </div>
        ) : (
          <div className="text-center mb-3">
            <Link
              to="/setup"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add baby profile for age-specific advice
            </Link>
          </div>
        )}
        <div className="flex justify-center gap-3 mb-5 text-xs">
          <Link
            to="/my-profile"
            className="text-blue-600 hover:text-blue-700"
          >
            {userProfile ? "Edit my profile" : "+ Set up my profile"}
          </Link>
          {!profile && (
            <Link
              to="/setup"
              className="text-blue-600 hover:text-blue-700"
            >
              + Add baby profile
            </Link>
          )}
        </div>

        {/* Food input */}
        <div className="mb-4">
          <textarea
            value={foodText}
            onChange={(e) => setFoodText(e.target.value)}
            placeholder="What food are you checking? e.g. 'chicken soup', 'mashed sweet potato'"
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Photo upload */}
        <div className="mb-5">
          {photoPreview ? (
            <div className="relative inline-block">
              <img
                src={photoPreview}
                alt="Food photo"
                className="w-24 h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={removePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 text-sm hover:border-gray-400 transition-colors"
            >
              📷 Take or upload a photo
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* When was it made */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            When was it made?
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {TIME_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => handleChipClick(chip.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedChip === chip.value
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={timeText}
            onChange={(e) => handleTimeTextChange(e.target.value)}
            placeholder="Or type: 'Sunday', 'last Thursday'..."
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || checking}
          className="w-full rounded-lg bg-blue-600 px-4 py-3.5 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {checking ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Checking...
            </span>
          ) : (
            "🔍 Check Food Safety"
          )}
        </button>
      </div>
    </div>
  );
}
