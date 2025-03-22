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

    // upvoteQuestion,
    // downvoteQuestion,
    // upvoteAnswer,
    // downvoteAnswer,
} = require("../handlers/questions.handlers");

router.get("/", getAllQuestionsHandler);

// 2. Question general routes
router.get("/new", requireAuth, renderQuestionForm);
router.post("/add", requireAuth, addAQuestion);
router.get("/:id", getQuestionByIdHandler);
router.post("/:id/edit", requireAuth, editAQuestion);
router.post("/:id/delete", requireAuth, deleteAQuestion);

// 3. Answer routes
router.post("/:id/answers/add", requireAuth, addAnAnswer);
router.post("/:id/answers/:answerId/edit", requireAuth, editAnAnswer);
router.post("/:id/answers/:answerId/delete", requireAuth, deleteAnAnswer);

// 4. Upvote/Downvote routes
router.post("/:id/vote", requireAuth, voteOnQuestion);
router.post("/:id/answers/:answerId/vote", requireAuth, voteOnAnswer);

// router.post("/:id/upvote", requireAuth, upvoteQuestion);
// router.post("/:id/downvote", requireAuth, downvoteQuestion);
// router.post("/:id/answers/:answerId/upvote", requireAuth, upvoteAnswer);
// router.post("/:id/answers/:answerId/downvote", requireAuth, downvoteAnswer);

module.exports = router;