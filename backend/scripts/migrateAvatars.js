// One-time migration: profile.avatar changed from a URL string to { url, publicId }.
// Run once from backend/:  node scripts/migrateAvatars.js
require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
    await mongoose.connect(process.env.DB_URI);
    // Raw collection access: the Mongoose schema no longer matches the old string values
    const users = mongoose.connection.db.collection("users");

    // The old pixabay placeholder isn't a real photo; drop it so the UI shows initials
    const cleared = await users.updateMany(
        { "profile.avatar": { $type: "string", $regex: /pixabay\.com/ } },
        { $unset: { "profile.avatar": "" } }
    );

    // Any other string is a custom avatar URL → { url: <old string> }
    const converted = await users.updateMany(
        { "profile.avatar": { $type: "string" } },
        [{ $set: { "profile.avatar": { url: "$profile.avatar" } } }]
    );

    console.log(`Removed placeholder avatars: ${cleared.modifiedCount}`);
    console.log(`Converted custom avatars:    ${converted.modifiedCount}`);
    await mongoose.disconnect();
})().catch(async (error) => {
    console.error("Migration failed:", error);
    await mongoose.disconnect();
    process.exit(1);
});
