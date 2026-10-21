const avatarService = require("../services/avatar.service");

const handle = (fn) => async (req, res) => {
    try {
        return res.status(200).json(await fn(req));
    } catch (error) {
        return res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = {
    getAvatarSignature: handle((req) => avatarService.getUploadSignature(req.user.id)),
    saveAvatar: handle((req) => avatarService.saveAvatar(req.user.id, req.body)),
    removeAvatar: handle((req) => avatarService.removeAvatar(req.user.id)),
};
