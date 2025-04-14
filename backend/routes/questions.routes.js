const express = require("express");
const router = express.Router();

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
router.get("/ask", renderQuestionForm);

// Submit a new question
router.post("/ask", addAQuestion);

// View a single question and its answers
router.get("/:id", getQuestionByIdHandler);

// Edit a question
router.post("/:id/edit", editAQuestion);

// Delete a question
router.post("/:id/delete", deleteAQuestion);


// === 3. Answer routes ===
// Add an answer to a question
router.post("/:id/answers/add", addAnAnswer);

// Edit an existing answer
router.post("/:id/answers/:answerId/edit", editAnAnswer);

// Delete an answer
router.post("/:id/answers/:answerId/delete", deleteAnAnswer);


// === 4. Upvote/Downvote routes ===
// Vote on a question (up/down)
router.post("/:id/vote", voteOnQuestion);

// Vote on an answer (up/down)
router.post("/:id/answers/:answerId/vote", voteOnAnswer);

module.exports = router;