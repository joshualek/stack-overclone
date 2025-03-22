const { ObjectId } = require("mongodb");
const {
    getUserById,
    insertQuestion,
    updateQuestion,
    deleteQuestion,
    deleteAnswer,
    toggleVoteOnQuestion,
    toggleVoteOnAnswer,
    // addUpvoteToQuestion,
    // addDownvoteToQuestion,
    // addUpvoteToAnswer,
    // addDownvoteToAnswer,
    getAllQuestions,
    getQuestionById } = require("../lib/database");

// 2. Question functions
const renderQuestionForm = (req, res) => {
    res.render("question_form", { user: req.user });
}

const addAQuestion = async (req, res) => {
    const { title, problem, tags } = req.body;

    // Assign the userid and user to each question
    const userId = req.user?._id || req.body.userId;
    if (!userId || !ObjectId.isValid(userId)) {
        console.error("Invalid user ID received:", userId);
        return res.status(400).send("Invalid user ID");
    }
    const user = await getUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    // Split tags by comma and trim whitespace, then insert the question object
    const tagsArray = tags ? tags.split(",").map((t) => t.trim()) : [];
    const question = await insertQuestion(
        { title, problem, tags: tagsArray, userId: userId, username: user.username }
    );
    if (!question || !question._id) {
        console.error("Question creation failed:", question);
        return res.status(500).send("Failed to create question");
    }

    res.redirect("/questions");
};

const editAQuestion = async (req, res) => {
    const questionId = req.params.id;
    const { title, problem, tags } = req.body;
    if (!await isValid(questionId, res)) { return; }

    // Split tags by comma and trim whitespace, then insert the question object
    const tagsArray = tags ? tags.split(",").map((t) => t.trim()) : [];
    const updatedQuestion = await updateQuestion(questionId, { title, problem, tags: tagsArray });
    if (!updatedQuestion) {
        console.error("Question update failed:", updatedQuestion);
        return res.status(500).send("Failed to update question");
    }

    res.redirect(`/questions/${questionId}`);
}

const deleteAQuestion = async (req, res) => {
    const questionId = req.params.id;
    if (!await isValid(questionId, res)) { return; }

    // Delete the question and redirect to the questions page
    await deleteQuestion(questionId);
    res.redirect("/questions");
}

const getAllQuestionsHandler = async (req, res) => {
    const questions = await getAllQuestions();
    res.render("questions", { questions });
}

const getQuestionByIdHandler = async (req, res) => {
    const questionId = req.params.id;
    if (!await isValid(questionId, res)) { return; }
    const question = await getQuestionById(questionId);

    res.render("question_single", { question, user: req.user });
}


// 3. Answer functions
const addAnAnswer = async (req, res) => {
    const questionId = req.params.id;
    const { answer } = req.body;
    const userId = req.user?._id || req.body.userId;
    if (!await isValid(questionId, res)) { return; }

    const answerData = {
        _id: new ObjectId(),
        body: answer,
        userId: new ObjectId(userId),
        username: (await getUserById(userId)).username,
        created: new Date(),
    }
    const updatedQuestion = await updateQuestion(questionId, { $push: { answers: answerData } });
    if (!updatedQuestion || updatedQuestion.modifiedCount === 0) {
        return res.status(500).send("Failed to add answer");
    }

    res.redirect(`/questions/${questionId}`);
}

const editAnAnswer = async (req, res) => {
    const { id: questionId, answerId } = req.params;
    const { updatedAnswer } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!await isValid(questionId, res)) { return; }
    const updatedQuestion = await updateQuestion(questionId, {
        $setAnswer: {
            answerId: new ObjectId(answerId),
            userId: new ObjectId(userId),
            newBody: updatedAnswer
        }
    })
    if (!updatedQuestion || updatedQuestion.modifiedCount === 0) {
        return res.status(500).send("Failed to update answer");
    }
    res.redirect(`/questions/${questionId}`);
}

const deleteAnAnswer = async (req, res) => {
    const { id: questionId, answerId } = req.params;
    const userId = req.user?._id || req.body.userId;

    if (!questionId || !answerId || !userId) { return res.status(400).send("Missing data"); }
    if (!await isValid(questionId, res)) { return; }

    try {
        const result = await deleteAnswer(questionId, answerId, userId);
        if (result.modifiedCount === 0) {
            return res.status(403).send("Failed to delete answer or not authorized");
        }
        res.redirect(`/questions/${questionId}`);

    } catch (err) {
        console.error("Error deleting answer:", err);
        res.status(500).send("Internal server error");
    }
};

// 4. Upvote/Downvote functions
const voteOnQuestion = async (req, res) => {
    const questionId = req.params.id;
    const userId = req.user._id;
    const voteType = req.body.voteType; // 'up' or 'down'
  
    if (!["up", "down"].includes(voteType)) {
      return res.status(400).send("Invalid vote type");
    }
  
    try {
      const result = await toggleVoteOnQuestion(questionId, userId, voteType);
      if (!result) { return res.status(400).send("Unable to process vote"); }
      res.redirect(`/questions/${questionId}`);
    } catch (err) {
      console.error("Vote error:", err);
      res.status(500).send("Vote error: " + err.message);
    }
  };

const voteOnAnswer = async (req, res) => {
    const { id: questionId, answerId } = req.params;
    const userId = req.user._id;
    const voteType = req.body.voteType; // 'up' or 'down'

    if (!["up", "down"].includes(voteType)) {
        return res.status(400).send("Invalid vote type");
    }
    
    try {
        const result = await toggleVoteOnAnswer(questionId, answerId, userId, voteType);
        if (!result) { return res.status(400).send("Unable to process vote"); }
        res.redirect(`/questions/${questionId}`);
    } catch (err) {
        console.error("Vote error:", err);
        res.status(500).send("Vote error: " + err.message);
    }
}


// const upvoteQuestion = async (req, res) => {
//     const questionId = req.params.id;
//     const userId = req.user._id;

//     try {
//         const result = await addUpvoteToQuestion(questionId, userId);
//         if (result.modifiedCount === 0) {
//             return res.status(400).send("Already upvoted or invalid");
//         }
//         res.redirect(`/questions/${questionId}`);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error upvoting question");
//     }
// };

// const downvoteQuestion = async (req, res) => {
//     const questionId = req.params.id;
//     const userId = req.user._id;
  
//     try {
//       const result = await addDownvoteToQuestion(questionId, userId);
//       if (result.modifiedCount === 0) {
//         return res.status(400).send("Already downvoted or not allowed");
//       }
//       res.redirect(`/questions/${questionId}`);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Error downvoting question");
//     }
// };

// const upvoteAnswer = async (req, res) => {
//     const { id: questionId, answerId } = req.params;
//     const userId = req.user._id;

//     try {
//         const result = await addUpvoteToAnswer(questionId, answerId, userId);
//         if (result.modifiedCount === 0) {
//             return res.status(400).send("Already upvoted or invalid");
//         }
//         res.redirect(`/questions/${questionId}`);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error upvoting answer");
//     }
// };

// const downvoteAnswer = async (req, res) => {
//     const { id: questionId, answerId } = req.params;
//     const userId = req.user._id;
  
//     try {
//       const result = await addDownvoteToAnswer(questionId, answerId, userId);
//       if (result.modifiedCount === 0) {
//         return res.status(400).send("Already downvoted or not allowed");
//       }
//       res.redirect(`/questions/${questionId}`);
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Error downvoting answer");
//     }
// };



// Helper function to check if a question ID and question is valid
const isValid = async (questionId, res) => {
    if (!ObjectId.isValid(questionId)) {
        res.status(400).send("Invalid question ID");
        return false;
    }

    const question = await getQuestionById(questionId);
    if (!question) {
        res.status(404).send("Question not found");
        return false;
    }
    return true;
};

module.exports = {
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
    // upvoteAnswer,
    // downvoteQuestion,
    // downvoteAnswer,
}