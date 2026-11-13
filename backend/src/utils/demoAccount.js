// The shared demo account. Its password is public (the login page has a "Try the demo" button),
// so the backend blocks every action that would change or delete it.
// Keep DEMO_PASSWORD in sync with Frontend/src/constants/demo.js.
const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "Demo@1234";

// every account created by scripts/seedUsers.js, the demo one included, uses this email domain
const SEED_EMAIL_DOMAIN = "seed.codehub.dev";

const isDemoUser = (payload) => payload?.username === DEMO_USERNAME;

module.exports = { DEMO_USERNAME, DEMO_PASSWORD, SEED_EMAIL_DOMAIN, isDemoUser };
