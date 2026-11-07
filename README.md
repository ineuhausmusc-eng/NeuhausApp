# NeuhausApp

Neuhaus Apps company website.

## Homepage artwork

The approved father-and-son mockup is retained in
`assets/img/neuhaus-team-approved.png`. The hero WebP/JPEG files are cropped
exports of that exact image, without repainting the portraits. Desktop uses the
complete hero composition; mobile uses a closer crop of both portraits and a
visible HTML headline. The desktop headline has an equivalent accessible H1.
Navigation, calls to action, app shortcuts and the directory remain live HTML.

The hero stays capped at 1280 CSS pixels so it does not stretch across large
monitors. New asset filenames and the homepage stylesheet version keep the
previous single-person artwork from being reused by browser caches.

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
