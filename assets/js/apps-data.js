/* ==========================================================================
   Neuhaus Apps — app data model
   The single place to change store destinations.

   apple        Direct US App Store listing (verified Nov 6, 2026).
   googlePlay   null until a Google Play listing is verified. When you set a
                URL here, every Android action for that app switches to it
                automatically and its label becomes "Get it on Google Play".
   android      Interim Android destination (studio Android updates page).
   ========================================================================== */
window.NEUHAUS_APPS = [
  {
    key: "orderless",
    name: "OrderLess",
    kind: "Takeout tracker",
    description: "Set a weekly takeout goal and log every delivery and pickup order.",
    keywords: "orderless takeout spending food goal pickup delivery order tracker weekly",
    icon: "/OrderLess/orderless-app-icon.png?v=ultraviolet-ember",
    apple: "https://apps.apple.com/us/app/orderless-takeout-tracker/id6808019506",
    googlePlay: null,
    android: "https://neuhausapps.com/android/",
    androidLabel: "Android updates",
    privacy: "https://neuhausapps.com/OrderLess/Privacy/",
    terms: "https://neuhausapps.com/OrderLess/Terms/"
  },
  {
    key: "prayer",
    name: "Prayer Matters",
    kind: "Prayer & Scripture",
    description: "Guided prayer, Scripture, and a private journal for daily reflection.",
    keywords: "prayer matters scripture bible journal reflection guided faith devotional",
    icon: "assets/img/apps/prayer-matters-icon.png",
    apple: "https://apps.apple.com/us/app/prayer-matters-bible-journal/id6798304453",
    googlePlay: null,
    android: "https://neuhausapps.com/android/",
    androidLabel: "Android updates",
    privacy: "https://neuhausapps.com/privacy.html",
    terms: "https://neuhausapps.com/terms.html"
  },
  {
    key: "swift",
    name: "SwiftShift Job Compare",
    kind: "Job offer comparison",
    description: "Compare job offers side by side, including pay, paid time off, and commute costs.",
    keywords: "swiftshift swift shift job compare offers pay salary commute pto paid time off compensation career",
    icon: "assets/img/apps/swiftshift-icon.jpg",
    apple: "https://apps.apple.com/us/app/swiftshift-job-compare/id6796545269",
    googlePlay: null,
    android: "https://neuhausapps.com/android/",
    androidLabel: "Android updates",
    privacy: "https://neuhausapps.com/swiftshift/support/",
    terms: "https://neuhausapps.com/terms.html"
  }
];
