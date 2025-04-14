const express = require("express");
const router = express.Router();
const { requireAuthJWT } = require("../middleware/auth");

const { 
    getAllQuestionsHandlerJSON,
    getQuestionByIdHandlerJSON,
    addAQuestionJSON,
    editAQuestionJSON,
    deleteAQuestionJSON,
    addAnAnswerJSON, 
    editAnAnswerJSON, 
    deleteAnAnswerJSON,
    voteOnQuestionJSON,
    voteOnAnswerJSON,
} = require("../handlers/api_questions.handlers");


// === 1. Image upload route for answers ===
const multer = require("multer");
const path = require("path");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "..", "uploads")); // backend/uploads
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

router.post("/image", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ location: fileUrl });
});


// === 2. Question general routes ===
// View all questions
router.get("/", getAllQuestionsHandlerJSON);

// Submit a new question
router.post("/ask", requireAuthJWT, addAQuestionJSON);

// View a single question and its answers
router.get("/:id", getQuestionByIdHandlerJSON);

// Edit a question
router.post("/:id/edit", requireAuthJWT, editAQuestionJSON);

// Delete a question
router.post("/:id/delete", requireAuthJWT, deleteAQuestionJSON);


// === 3. Answer routes ===
// Add an answer to a question
router.post("/:id/answers/add", requireAuthJWT, addAnAnswerJSON);

// Edit an existing answer
router.post("/:id/answers/:answerId/edit", requireAuthJWT, editAnAnswerJSON);

// Delete an answer
router.post("/:id/answers/:answerId/delete", requireAuthJWT, deleteAnAnswerJSON);


// === 4. Upvote/Downvote routes ===
// Vote on a question (up/down)
router.post("/:id/vote", requireAuthJWT, voteOnQuestionJSON);

// Vote on an answer (up/down)
router.post("/:id/answers/:answerId/vote", requireAuthJWT, voteOnAnswerJSON);

module.exports = router;