const express = require("express");
const router = express.Router();
const { getAllUsers, getAllQuestions } = require("../lib/database");

router.get("/stats", async (req, res) => {
  try {
    const users = await getAllUsers();
    const questions = await getAllQuestions();

    let answerCount = 0;
    questions.forEach((q) => {
      answerCount += q.answers?.length || 0;
    });

    res.json({
      users: users.length,
      questions: questions.length,
      answers: answerCount
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

module.exports = router;
