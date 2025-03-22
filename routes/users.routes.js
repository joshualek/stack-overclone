const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
    getUserProfile,
    editUserProfile,
    addAUser,
    deleteAUser,
    getAllUsersHandler,
    getAUser,
} = require("../handlers/users.handlers");

const { requireAuth } = require("../middleware/auth");

const upload = multer({ 
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "public/uploads/");
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + "-" + file.originalname);
        }
    })
});

router.get("/:id", requireAuth, getUserProfile);
router.post("/:id", requireAuth, editUserProfile);
// router.post("/:id", upload.single("profilePic"), editUserProfile);
router.post("/:id", upload.single("profilePic"), (req, res, next) => {
    console.log("Multer processed file:", req.file);
    next();
}, editUserProfile);


module.exports = router;