# Can I Still Eat This?

A food safety checker for parents and families. Snap a photo or describe your leftovers, tell us when it was made, and get an instant verdict on whether it's still safe to eat -- with special guidance for babies, toddlers, and pregnant women.

**Live app:** [can-i-still-eat-this-3bb169d2.base44.app](https://can-i-still-eat-this-3bb169d2.base44.app/)

## Features

- **Food safety check** -- describe food via text or photo, select when it was made, and get an AI-powered safety verdict
- **Baby profiles** -- add your baby's name and date of birth for age-appropriate food safety advice
- **User profiles** -- set your gender and pregnancy status for personalized guidance
- **Pregnancy-aware** -- flags risks like listeria, mercury, and toxoplasmosis for pregnant women
- **Time-smart** -- quick-select chips (Today, Yesterday, 2/3 days ago) or free-text input ("last Sunday")
- **Photo recognition** -- upload or snap a photo and the AI identifies the food automatically

## Tech Stack

- **Frontend:** React 18, React Router v7, Tailwind CSS
- **Backend:** [Base44](https://base44.com) (auth, database, file uploads, AI/LLM)
- **Build:** Vite
- **Icons:** Lucide React

## Getting Started

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run build
npx base44 deploy --yes
```

## Project Structure

```
src/
  api/            # Base44 SDK client
  components/     # Shared UI components (Button, Input, Checkbox, ProtectedRoute)
  pages/
    LoginPage     # Google OAuth sign-in
    SetupPage     # Baby profile creation
    MyProfilePage # User profile (name, gender, pregnancy)
    CheckPage     # Main food safety checker
    ResultPage    # Safety verdict and recommendations
base44/
  entities/       # Data models (BabyProfile, UserProfile)
```
