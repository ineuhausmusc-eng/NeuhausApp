# NeuhausApp

Neuhaus Apps company website.

## Homepage artwork

The homepage uses the approved layered father-and-son animation. Portrait cutouts
and high-resolution antique patina platform icons live in `assets/img/hero/`.
Hovering or focusing a portrait reveals its platform link with an 875 ms blur
and fade; the icon stays sharp and grows 9% on hover, keyboard focus, or press.
On touch screens, tap the portrait, then tap the revealed icon. Reduced-motion
settings disable transitions, and fallback platform links work without JavaScript.
The full wordmark and headline are responsive HTML rather than cropped image text.

The hero stays capped at 1280 CSS pixels. Icons use 640-pixel source images and
render at no more than 174 CSS pixels, preserving detail on high-density screens.

## Deployment

The site is prepared for GitHub Pages artifact deployment. The committed OrderLess
bundle contains inert markers instead of its browser-public RevenueCat key and
TikTok Pixel ID. The manual `Deploy Neuhaus Apps site` workflow replaces those
markers from repository variables while creating the Pages artifact.

Required repository variables:

- `VITE_RC_PUBLIC_WEB_KEY`
- `VITE_TIKTOK_PIXEL_ID`

The workflow fails closed if either value is missing or malformed. Configure Pages
to use GitHub Actions before committing a marker-based OrderLess bundle to `main`;
otherwise legacy branch deployment would publish an unusable checkout.
