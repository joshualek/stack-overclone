const express = require("express");
const router = express.Router();
const { editUserProfile, getUserProfile } = require("../handlers/users.handlers");
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

router.get("/:id", getUserProfile);
router.post("/:id/edit", upload.single("profilePic"), editUserProfile);

module.exports = router;
