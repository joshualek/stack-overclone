const express = require("express");
const router = express.Router();

const { editUserProfileJSON, getUserProfileJSON } = require("../handlers/api_users.handlers");
const { requireAuth } = require("../middleware/auth");
const multer = require("multer");

// Setup multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.get("/:id", getUserProfileJSON);
router.post("/:id/edit", requireAuth, upload.single("profilePic"), editUserProfileJSON);

module.exports = router;