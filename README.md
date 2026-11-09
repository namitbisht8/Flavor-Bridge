# Flavor Bridge 🍵

**Healthy food that still tastes like home.** 🏠

Flavor Bridge helps people on restricted diets (low salt, low sugar, dairy-free, vegan) rebuild a favourite dish so it keeps its taste. Instead of just deleting salt, sugar or dairy, it finds *smell twins*, natural ingredients that share the aroma of what was removed, and checks the rebuilt dish against the limit the user sets.

Built by **Team Quad Core** 🤜🤛 for **Foodoscope Fork It 2026** (IIIT Delhi, CoSyLab).

> **Live demo:** https://flavor-bridge.ai.studio/

---

## The problem ⚠️

Diets fail when food stops tasting good. Most diet apps only count calories, and simply cutting salt, butter or sugar leaves bland food that people give up on.

## Our idea 💡

1. **Cut** only what the diet restricts (salt, sugar, fat, dairy, allergens).
2. **Find smell twins** using flavor-molecule data, so the aroma of the removed ingredient is recreated with natural spices and ingredients.
3. **Rebuild** the dish with real cooking steps, then **check** it against the limit.

## Features ✨

| Feature | Status |
|---|---|
| Diet profile screen (vegetarian, vegan, non-veg, dairy-free) and allergy chips | In progress |
| Build-your-own-dish page with ingredient removal | In progress |
| Before vs after card (sodium, saturated fat, sugar, flavor match) | In progress |
| Smell-twin explainer ("Why this works") | In progress |
| Cost and difficulty estimates | In progress |
| Shopping list with Amazon and Flipkart search links | In progress |
| Share on WhatsApp, save recipe, read aloud | In progress |
| Indian kitchen mode (desi dishes and spice swaps) | Planned |
| Voice input | Planned |
| Photo scan of a dish (ingredients detected from an image) | Planned |
| Friendly AI assistant | Planned |

_Update this table as features are finished._

## Data sources

- **RecipeDB**: recipes, ingredients, nutrition and cooking steps (CoSyLab, IIIT Delhi).
- **FlavorDB**: flavor molecules and aroma profiles of natural ingredients (CoSyLab, IIIT Delhi).
- Accessed through the **Foodoscope** APIs: https://www.foodoscope.com

The app can run in two modes:

- **Sample mode** (default): uses a small hand-made data file. Screens show a **"Sample data"** badge.
- **Live mode**: calls the Foodoscope APIs from a server-side function using your own API key.

## How it works

```
User  ->  Website  ->  Server function  ->  RecipeDB / FlavorDB (Foodoscope APIs)
                              |
                              +->  Limit checker  ->  Rebuilt dish + flavor score
```

- The website never sees the API key. Keys are read from environment variables on the server.
- Cost and difficulty are **estimates** from a small ingredient price table and simple rules.
- The AI assistant (when added) only explains results that come from the pipeline. It does not invent nutrition values or recipes.

## Run locally

Requirements: Node.js 18 or newer.

```bash
git clone https://github.com/namitbisht8/Flavor-Bridge.git
cd Flavor-Bridge
npm install
cp .env.example .env.local   # then add your own keys
npm run dev
```

Open the local address shown in the terminal.

## Environment variables

Copy `.env.example` to `.env.local` and fill in your own values. **Never commit `.env.local`.**

| Name | Purpose |
|---|---|
| `API_MODE` | `sample` (default) or `live` |
| `FOODOSCOPE_API_KEY` | Foodoscope API key (server-side only) |
| `GEMINI_API_KEY` | Optional, for photo scan and the assistant (server-side only) |

On Vercel, add the same names under **Project Settings, Environment Variables**, then redeploy.

## Security

- Keys live only in environment variables and are never written in code or committed.
- Do not name secrets with `NEXT_PUBLIC_` or `VITE_` prefixes, because those are sent to the browser.
- If a key is ever exposed, generate a new one immediately.

## Team Quad Core 𐦂𖨆𐀪𖠋𐀪𐀪

- Namit Bisht (Team Leader)
- Shreya Gupta
- Tanish Paraswal
- Sakshi Parihar

## Disclaimer

Flavor Bridge gives food suggestions, **not medical advice**. Please confirm dietary limits with your doctor or dietitian.

## Acknowledgements

RecipeDB and FlavorDB are resources of the Complex Systems Laboratory (CoSyLab), IIIT Delhi. Please follow their data licences and citation requirements.
