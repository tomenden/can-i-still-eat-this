# Can I Still Eat This? — Design Spec

## Overview

A mobile-first web app that helps parents quickly determine if leftover food is still safe to feed their baby (or themselves). Users describe the food via text or photo, say when it was made, and get an instant LLM-powered verdict with age-appropriate safety guidance.

## Target Users

Parents with young children (babies/toddlers) who frequently cook and store food, then need to know if leftovers are still safe — especially for their child.

## User Flow

### 1. Login
- Google authentication via Base44's `loginWithProvider('google')`
- Lands on main check screen if baby profile exists, otherwise profile setup

### 2. First Launch — Baby Profile Setup
- Shown once after first login (when no BabyProfile entity exists for the user)
- Fields: baby's name, date of birth
- "Save & Continue" takes user to main screen
- Can be edited later from a settings/profile area

### 3. Main Screen — Quick Check
The primary screen. Always immediately accessible after login.

**"Who's eating" toggle:**
- Two-option toggle: "For [baby name]" (default) / "For Me"
- Baby option uses DOB to calculate current age for the LLM prompt
- If no baby profile exists (user skipped setup), only "For Me" is shown with a prompt to add a baby profile

**Food input (one of):**
- Text area: free-text description (e.g. "chicken soup", "mashed sweet potato with carrots")
- Photo upload: camera capture or gallery pick — LLM identifies the food from the image

**When was it made:**
- Quick-select chips: "Today", "Yesterday", "2 days ago", "3 days ago"
- Free text input below: accepts natural language like "Sunday", "last Thursday", "5 days ago"
- Only one selection active at a time (chip or text)

**Submit button:** "Check Food Safety"

### 4. Result Screen
Displays the LLM's verdict clearly:

**Safe result:**
- Large green checkmark
- "Safe to eat!" heading
- "Good for about X more day(s)" subheading
- Details section: explanation of food safety reasoning
- Age-specific notes: guidance specific to the baby's age (e.g. "reheat to steaming")
- Storage tips

**Unsafe result:**
- Large red X
- "Don't eat this" heading
- "Past safe consumption window" subheading
- Details section: why it's no longer safe
- Age-specific notes: extra risks for young children
- What to do (discard)

**Both results show:**
- "Check another food" button to return to main screen

## Data Model

### Entity: BabyProfile
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Baby's name |
| `date_of_birth` | string (date) | Baby's date of birth, used for age calculation |

- One profile per user (enforced in app logic)
- Row-level security: users can only read/write their own profiles
- No history entity — this is a one-shot check tool

## LLM Integration

### Approach
Single `integrations.Core.InvokeLLM` call per check. No backend functions needed.

### Input Construction
The prompt includes:
- Food description (text) OR instruction to analyze the provided image
- When it was made (resolved to approximate days/hours ago in the prompt)
- Who's eating: "adult" or "baby, age X months"
- Current date for reference

### Image Handling
- User uploads photo via `integrations.Core.UploadFile`
- Returned file URL is passed to `InvokeLLM` as an image input
- LLM identifies the food from the image and proceeds with safety analysis

### Expected Response Format
The prompt instructs the LLM to return JSON:
```json
{
  "safe": true,
  "daysRemaining": 1,
  "explanation": "Chicken soup stored in the fridge is generally safe for 3-4 days...",
  "ageSpecificNotes": "Safe for babies over 12 months. Reheat thoroughly to steaming.",
  "storageTips": "Keep refrigerated at 4°C or below. Can be frozen for up to 3 months."
}
```

The `response_type` parameter is set to `"json"` to ensure structured output.

## Tech Stack

- **Platform:** Base44 (`backend-and-client` template)
- **Frontend:** Vite + React + Tailwind CSS
- **Auth:** Google login via Base44 auth
- **Data:** Base44 entities (BabyProfile only)
- **AI:** Base44 `integrations.Core.InvokeLLM`
- **File upload:** Base44 `integrations.Core.UploadFile`
- **Routing:** React Router (login → setup → main → result)

## Screen Architecture

| Route | Screen | When shown |
|-------|--------|------------|
| `/login` | Login page with Google sign-in | Not authenticated |
| `/setup` | Baby profile setup | Authenticated, no BabyProfile exists |
| `/` | Main check screen | Authenticated, profile exists |
| `/result` | Result display | After check submission (result passed via state) |

## Mobile-First Design

- All screens designed for phone viewport first
- Single column layout throughout
- Large touch targets for chips and buttons
- Works on desktop but optimized for mobile use
- Tailwind responsive utilities for any desktop adjustments

## Error Handling

- **LLM fails or returns unparseable response:** Show friendly error message with "Try again" button
- **Image upload fails:** Show error, suggest using text input instead
- **No network:** Standard browser offline handling
- **Ambiguous food:** LLM prompt instructs it to ask for clarification in the explanation field and err on the side of caution (mark as unsafe when uncertain)

## Out of Scope (for now)

- Food check history / fridge log
- Sharing profiles between accounts
- Push notifications ("your chicken expires tomorrow")
- Multiple baby profiles
- Offline support
