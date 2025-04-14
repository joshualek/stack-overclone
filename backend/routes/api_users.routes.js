const express = require("express");
const router = express.Router();
const path = require("path");

const { getAllUsersJSON, getUserProfileJSON, editUserProfileJSON, } = require("../handlers/api_users.handlers");
const { requireAuthJWT } = require("../middleware/auth");
const multer = require("multer");

// Setup multer
const uploadPath = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); 
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
module.exports = upload;

router.get("/", getAllUsersJSON);
router.get("/:id", getUserProfileJSON);
router.patch("/:id/edit", requireAuthJWT, upload.single("profilePic"), editUserProfileJSON);

module.exports = router;