# NeuhausApp

Neuhaus Apps company website.

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
