/* ==========================================================================
   Neuhaus Apps — app data model
   The single place to change store destinations.

   apple        Direct US App Store listing (verified Nov 27, 2026).
   googlePlay   Verified Google Play listing, or null for iPhone-only apps.
   ========================================================================== */
window.NEUHAUS_APPS = [
  {
    key: "swift",
    name: "SwiftShift Job Compare",
    kind: "Job offer comparison",
    description: "Compare job offers side by side, including pay, paid time off, and commute costs.",
    keywords: "swiftshift swift shift job jobs compare offers pay salary commute pto paid time off compensation career",
    icon: "/assets/img/apps/swiftshift-app-icon.png",
    apple: "https://apps.apple.com/us/app/swiftshift-job-compare/id6796545269",
    googlePlay: null,
    privacy: "/swiftshift/support/#privacy",
    terms: "/swiftshift/terms/"
  },
  {
    key: "orderless",
    name: "OrderLess",
    kind: "Takeout tracker",
    description: "Set a weekly takeout goal and log every delivery and pickup order.",
    keywords: "orderless takeout spending food goal pickup delivery order tracker weekly",
    icon: "/OrderLess/orderless-app-icon.png?v=ultraviolet-ember",
    apple: "https://apps.apple.com/us/app/orderless-takeout-tracker/id6808019506",
    googlePlay: null,
    privacy: "/OrderLess/Privacy/",
    terms: "/OrderLess/Terms/"
  },
  {
    key: "prayer",
    name: "Prayer Matters",
    kind: "Prayer & Scripture",
    description: "Guided prayer, Scripture, and a private journal for daily reflection.",
    keywords: "prayer matters scripture bible journal reflection guided faith devotional",
    icon: "/assets/img/apps/prayer-matters-icon.png",
    apple: "https://apps.apple.com/us/app/prayer-matters-bible-journal/id6798304453",
    googlePlay: "https://play.google.com/store/apps/details?id=com.prayermatters.app",
    privacy: "/privacy.html",
    terms: "/terms.html"
  }
];
