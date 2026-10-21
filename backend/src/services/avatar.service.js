const cloudinary = require("../config/cloudinary.config");
const { user } = require("../models/user");
const { BadRequestError, NotFoundError } = require("../utils/appError");

// One fixed file per user: a new upload overwrites the old one
const avatarPublicId = (userId) => `codehub/avatars/${userId}`;

// ③ The "permission slip": the server picks every parameter, the client can't change any
function getUploadSignature(userId) {
    const params = {
        public_id: avatarPublicId(userId),
        overwrite: true,
        invalidate: true,                      // drop CDN copies of the old photo
        allowed_formats: "jpg,png,webp",
        transformation: "c_limit,w_512,h_512", // shrink on arrival even if the client didn't
        timestamp: Math.round(Date.now() / 1000),
    };
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
    return {
        ...params,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    };
}

// ⑦ Confirm the upload really came from Cloudinary and belongs to this user, then save it
async function saveAvatar(userId, { public_id, version, signature } = {}) {
    if (public_id !== avatarPublicId(userId)) {
        throw new BadRequestError("This upload does not belong to your account");
    }
    if (!version || !signature || !cloudinary.utils.verify_api_response_signature(public_id, version, signature)) {
        throw new BadRequestError("Invalid upload signature");
    }

    // Build the URL ourselves; never store a URL the client sent
    // analytics: false keeps the SDK's "?_a=..." tracking suffix out of the stored URL
    const url = cloudinary.url(public_id, { version, secure: true, analytics: false });

    const updated = await user.findByIdAndUpdate(
        userId,
        { $set: { "profile.avatar": { url, publicId: public_id } } },
        { new: true }
    );
    if (!updated) throw new NotFoundError("User not found");
    return { avatar: url };
}

// "Remove photo"
async function removeAvatar(userId) {
    await cloudinary.uploader.destroy(avatarPublicId(userId), { invalidate: true });
    await user.findByIdAndUpdate(userId, { $unset: { "profile.avatar": "" } });
    return { avatar: null };
}

module.exports = { getUploadSignature, saveAvatar, removeAvatar, avatarPublicId };
