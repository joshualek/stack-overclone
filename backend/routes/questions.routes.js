const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { 
    renderQuestionForm,
    addAQuestion,
    editAQuestion,
    deleteAQuestion,
    getAllQuestionsHandler,
    getQuestionByIdHandler,
    addAnAnswer, 
    editAnAnswer, 
    deleteAnAnswer,
    voteOnQuestion,
    voteOnAnswer,
} = require("../handlers/questions.handlers");

router.get("/", getAllQuestionsHandler);

// === 2. Question general routes ===
// View all questions
router.get("/", getAllQuestionsHandler);

// Show form to ask a question
router.get("/ask", requireAuth, renderQuestionForm);

// Submit a new question
router.post("/ask", requireAuth, addAQuestion);

// View a single question and its answers
router.get("/:id", getQuestionByIdHandler);

// Edit a question
router.post("/:id/edit", requireAuth, editAQuestion);

// Delete a question
router.post("/:id/delete", requireAuth, deleteAQuestion);


// === 3. Answer routes ===
// Add an answer to a question
router.post("/:id/answers/add", requireAuth, addAnAnswer);

// Edit an existing answer
router.post("/:id/answers/:answerId/edit", requireAuth, editAnAnswer);

// Delete an answer
router.post("/:id/answers/:answerId/delete", requireAuth, deleteAnAnswer);


// === 4. Upvote/Downvote routes ===
// Vote on a question (up/down)
router.post("/:id/vote", requireAuth, voteOnQuestion);

// Vote on an answer (up/down)
router.post("/:id/answers/:answerId/vote", requireAuth, voteOnAnswer);

module.exports = router;