import { useLocation, useNavigate, Navigate } from "react-router-dom";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, forBaby, profile } = location.state || {};

  if (!result) {
    return <Navigate to="/" replace />;
  }

  const isSafe = result.safe;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Verdict banner */}
        <div
          className={`text-center rounded-2xl p-6 mb-5 ${
            isSafe ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <div className="text-5xl mb-3">{isSafe ? "✅" : "❌"}</div>
          <h1
            className={`text-2xl font-bold mb-1 ${
              isSafe ? "text-green-800" : "text-red-800"
            }`}
          >
            {isSafe ? "Safe to eat!" : "Don't eat this"}
          </h1>
          <p
            className={`text-sm ${
              isSafe ? "text-green-700" : "text-red-600"
            }`}
          >
            {isSafe
              ? result.days_remaining != null
                ? `Good for about ${result.days_remaining} more day${result.days_remaining !== 1 ? "s" : ""}`
                : "Should be fine for now"
              : "Past safe consumption window"}
          </p>
        </div>

        {/* Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          {result.explanation && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Details
              </h3>
              <p className="text-sm text-gray-600">{result.explanation}</p>
            </div>
          )}

          {result.age_specific_notes && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {forBaby && profile
                  ? `For ${profile.name}`
                  : "For you"}
              </h3>
              <p className="text-sm text-gray-600">
                {result.age_specific_notes}
              </p>
            </div>
          )}

          {result.storage_tips && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Storage tips
              </h3>
              <p className="text-sm text-gray-600">{result.storage_tips}</p>
            </div>
          )}
        </div>

        {/* Check another */}
        <button
          onClick={() => navigate("/", { replace: true })}
          className="w-full rounded-lg bg-gray-100 px-4 py-3 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
        >
          ← Check another food
        </button>
      </div>
    </div>
  );
}
