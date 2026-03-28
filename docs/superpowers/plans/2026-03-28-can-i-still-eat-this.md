# Can I Still Eat This? — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first web app that helps parents check if leftover food is safe for their baby or themselves, powered by an LLM.

**Architecture:** A Base44 `backend-and-client` (Vite + React + Tailwind) app with Google auth, a single `BabyProfile` entity, and `InvokeLLM` integration for food safety analysis. No backend functions — everything runs client-side via Base44 SDK. React Router handles navigation between login, setup, main check, and result screens.

**Tech Stack:** Base44 SDK, Vite, React, React Router, Tailwind CSS

---

## File Structure

```
can-i-still-eat-this/
├── base44/
│   ├── config.jsonc                    # Base44 project config (created by CLI)
│   ├── .app.jsonc                      # App ID (created by CLI)
│   └── entities/
│       └── baby-profile.jsonc          # BabyProfile entity schema
├── src/
│   ├── api/
│   │   └── base44Client.js             # Pre-configured Base44 SDK client (created by CLI)
│   ├── App.jsx                         # Root component with router
│   ├── main.jsx                        # Entry point (created by CLI)
│   ├── index.css                       # Global styles / Tailwind imports (created by CLI)
│   ├── pages/
│   │   ├── LoginPage.jsx               # Google login screen
│   │   ├── SetupPage.jsx               # Baby profile setup
│   │   ├── CheckPage.jsx               # Main food check form
│   │   └── ResultPage.jsx              # Safety verdict display
│   └── components/
│       └── ProtectedRoute.jsx          # Auth guard wrapper
├── index.html                          # SPA entry point (created by CLI)
├── package.json
├── vite.config.js
└── tailwind.config.js
```

**Responsibilities:**
- `base44Client.js` — SDK client singleton, used by all pages
- `App.jsx` — React Router setup, route definitions
- `ProtectedRoute.jsx` — Checks auth, redirects to login if needed
- `LoginPage.jsx` — Google sign-in button, branding
- `SetupPage.jsx` — Baby name + DOB form, creates BabyProfile entity
- `CheckPage.jsx` — Food input (text/photo), time selection, who's-eating toggle, LLM call
- `ResultPage.jsx` — Displays safe/unsafe verdict with details

---

### Task 1: Scaffold Base44 Project

**Files:**
- Create: `base44/config.jsonc` (via CLI)
- Create: `base44/.app.jsonc` (via CLI)
- Create: `src/api/base44Client.js` (via CLI)
- Create: `package.json` (via CLI)
- Create: all Vite/React/Tailwind boilerplate (via CLI)

- [ ] **Step 1: Create the Base44 project**

```bash
cd /Users/tome/projects/can-i-still-eat-this
npm install --save-dev base44
npx base44 create can-i-still-eat-this -p . -t backend-and-client
```

Expected: Project scaffolded with `base44/` folder, `src/`, `package.json`, `vite.config.js`, etc.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/tome/projects/can-i-still-eat-this
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Verify the dev server starts**

```bash
cd /Users/tome/projects/can-i-still-eat-this
npx vite --host 2>&1 | head -5
```

Expected: Vite dev server starts on a local port. Kill it after verifying.

- [ ] **Step 4: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Base44 project with backend-and-client template"
```

---

### Task 2: Define BabyProfile Entity

**Files:**
- Create: `base44/entities/baby-profile.jsonc`

- [ ] **Step 1: Create the entity schema file**

Create `base44/entities/baby-profile.jsonc`:

```jsonc
{
  "name": "BabyProfile",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Baby's name"
    },
    "date_of_birth": {
      "type": "string",
      "format": "date",
      "description": "Baby's date of birth"
    }
  },
  "required": ["name", "date_of_birth"],
  "rls": {
    "create": true,
    "read": { "created_by": "{{user.email}}" },
    "update": { "created_by": "{{user.email}}" },
    "delete": { "created_by": "{{user.email}}" }
  }
}
```

- [ ] **Step 2: Push entity to Base44**

```bash
cd /Users/tome/projects/can-i-still-eat-this
npx base44 entities push
```

Expected: Entity pushed successfully.

- [ ] **Step 3: Commit**

```bash
git add base44/entities/baby-profile.jsonc
git commit -m "feat: add BabyProfile entity with owner-only RLS"
```

---

### Task 3: Auth Guard and Login Page

**Files:**
- Create: `src/components/ProtectedRoute.jsx`
- Create: `src/pages/LoginPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Install React Router**

```bash
cd /Users/tome/projects/can-i-still-eat-this
npm install react-router-dom
```

- [ ] **Step 2: Create ProtectedRoute component**

Create `src/components/ProtectedRoute.jsx`:

```jsx
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import base44 from "../api/base44Client";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

- [ ] **Step 3: Create LoginPage**

Create `src/pages/LoginPage.jsx`:

```jsx
import base44 from "../api/base44Client";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    base44.auth.loginWithProvider("google", window.location.origin + "/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🍽️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Can I Still Eat This?
        </h1>
        <p className="text-gray-500 text-lg">
          Check if leftover food is safe for your baby
        </p>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium shadow-sm hover:shadow-md transition-shadow"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Set up App.jsx with router**

Replace the contents of `src/App.jsx` with:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Authenticated! Pages coming soon.</p>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 5: Verify login flow works**

```bash
cd /Users/tome/projects/can-i-still-eat-this
npx vite --host
```

Open the dev URL in a browser. Confirm you're redirected to `/login` and the Google sign-in button appears. Click it to verify the OAuth flow redirects correctly.

- [ ] **Step 6: Commit**

```bash
git add src/components/ProtectedRoute.jsx src/pages/LoginPage.jsx src/App.jsx package.json package-lock.json
git commit -m "feat: add Google login and auth-protected routing"
```

---

### Task 4: Baby Profile Setup Page

**Files:**
- Create: `src/pages/SetupPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create SetupPage**

Create `src/pages/SetupPage.jsx`:

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import base44 from "../api/base44Client";

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

        <p className="text-center text-gray-400 text-xs mt-4">
          You can also check food safety for yourself
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Update App.jsx to route through setup when no profile exists**

Replace `src/App.jsx` with:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SetupPage from "./pages/SetupPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Main screen coming next.</p>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 3: Update ProtectedRoute to check for baby profile and redirect to setup**

Replace `src/components/ProtectedRoute.jsx` with:

```jsx
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import base44 from "../api/base44Client";

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, user: null, hasProfile: false });
  const location = useLocation();

  useEffect(() => {
    async function check() {
      try {
        const user = await base44.auth.me();
        if (!user) {
          setState({ loading: false, user: null, hasProfile: false });
          return;
        }
        const profiles = await base44.entities.BabyProfile.list(null, 1);
        setState({ loading: false, user, hasProfile: profiles.length > 0 });
      } catch {
        setState({ loading: false, user: null, hasProfile: false });
      }
    }
    check();
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!state.user) {
    return <Navigate to="/login" replace />;
  }

  // If no profile and not already on /setup, redirect to setup
  if (!state.hasProfile && location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  return children;
}
```

- [ ] **Step 4: Test the setup flow**

Start the dev server and verify:
1. After login, you're redirected to `/setup` (since no profile exists)
2. Fill in name + DOB, click "Save & Continue"
3. After saving, redirected to `/` (main screen placeholder)

- [ ] **Step 5: Commit**

```bash
git add src/pages/SetupPage.jsx src/App.jsx src/components/ProtectedRoute.jsx
git commit -m "feat: add baby profile setup page with redirect flow"
```

---

### Task 5: Main Check Page

**Files:**
- Create: `src/pages/CheckPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create CheckPage**

Create `src/pages/CheckPage.jsx`:

```jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import base44 from "../api/base44Client";

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
  const [forBaby, setForBaby] = useState(true);
  const [foodText, setFoodText] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedChip, setSelectedChip] = useState(null);
  const [timeText, setTimeText] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.entities.BabyProfile.list(null, 1).then((profiles) => {
      if (profiles.length > 0) setProfile(profiles[0]);
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

      const eaterDescription = forBaby && profile
        ? `a baby named ${profile.name}, who is ${babyAge} months old`
        : "an adult";

      const foodDescription = foodText
        ? `The food is: ${foodText}`
        : "Please identify the food from the attached image.";

      const prompt = `You are a food safety expert. A parent is asking whether leftover food is still safe to eat.

${foodDescription}

The food was made: ${timeDesc}.
Today's date is: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

The person who would eat this food is: ${eaterDescription}.

Analyze the food safety and respond with a JSON object. Be conservative — when in doubt, err on the side of caution, especially for babies and toddlers. Consider:
- How long the food type typically stays safe when refrigerated
- Age-appropriate risks for babies/toddlers
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

      navigate("/result", { state: { result, forBaby, profile } });
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
        {profile && (
          <div className="flex bg-gray-200 rounded-lg p-1 mb-5">
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
              🧑 For Me
            </button>
          </div>
        )}

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
```

- [ ] **Step 2: Update App.jsx to add the check route**

Replace `src/App.jsx` with:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SetupPage from "./pages/SetupPage";
import CheckPage from "./pages/CheckPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CheckPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 3: Test the check page**

Start the dev server. After login and profile setup, verify:
1. Main screen shows with baby name in the toggle
2. Can type food description
3. Can upload a photo
4. Can select time chips or type free text
5. Chips and text input are mutually exclusive

- [ ] **Step 4: Commit**

```bash
git add src/pages/CheckPage.jsx src/App.jsx
git commit -m "feat: add main food check page with text/photo input and time selection"
```

---

### Task 6: Result Page

**Files:**
- Create: `src/pages/ResultPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create ResultPage**

Create `src/pages/ResultPage.jsx`:

```jsx
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
```

- [ ] **Step 2: Update App.jsx to add the result route**

Replace `src/App.jsx` with:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SetupPage from "./pages/SetupPage";
import CheckPage from "./pages/CheckPage";
import ResultPage from "./pages/ResultPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<ProtectedRoute><SetupPage /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><CheckPage /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 3: End-to-end test**

Start the dev server and run a full flow:
1. Login with Google
2. (If first time) Set up baby profile
3. On main screen, type "chicken soup", select "Yesterday", keep "For [baby]" selected
4. Click "Check Food Safety"
5. Verify result page shows a verdict with explanation and age-specific notes
6. Click "Check another food" — returns to main screen

- [ ] **Step 4: Commit**

```bash
git add src/pages/ResultPage.jsx src/App.jsx
git commit -m "feat: add result page with safe/unsafe verdict display"
```

---

### Task 7: Deploy

**Files:**
- No new files

- [ ] **Step 1: Build the project**

```bash
cd /Users/tome/projects/can-i-still-eat-this
npm run build
```

Expected: Build succeeds, output in `dist/` directory.

- [ ] **Step 2: Deploy to Base44**

```bash
cd /Users/tome/projects/can-i-still-eat-this
npx base44 deploy -y
```

Expected: Entities, site deployed successfully. URL printed.

- [ ] **Step 3: Open the deployed site**

```bash
npx base44 site open
```

Verify the full flow works on the live URL. Test on mobile browser for the intended mobile-first experience.

- [ ] **Step 4: Commit any build/deploy config changes if needed**

```bash
git add -A
git status
# Only commit if there are meaningful changes
git commit -m "chore: deploy to Base44"
```
