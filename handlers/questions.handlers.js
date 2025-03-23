const { ObjectId } = require("mongodb");
const {
    getUserById,
    insertQuestion,
    updateQuestion,
    deleteQuestion,
    getAllQuestions,
    getQuestionById,
    toggleVoteOnQuestion,
    toggleVoteOnAnswer,
    deleteAnswer,
} = require("../lib/database");

const {
    isValidObjectId,
    toObjectId,
    isSameUser
} = require("../lib/validators");

// 1. Question functions
const renderQuestionForm = (req, res) => {
    res.render("question_form", { user: req.user });
};

const addAQuestion = async (req, res) => {
    const { title, problem, tags } = req.body;
    const userId = req.user._id;

    // Perform validation
    if (!isValidObjectId(userId)) return res.status(400).send("Invalid user ID");
    const user = await getUserById(userId);
    if (!user) return res.status(404).send("User not found");

    // Insert the question to the database
    const tagsArray = tags ? tags.split(",").map(t => t.trim()) : [];
    const question = await insertQuestion({
        title,
        problem,
        tags: tagsArray,
        userId,
        username: user.username,
        created: new Date()
    });

    if (!question || !question._id) return res.status(500).send("Failed to create question");

    res.redirect("/questions");
};

const editAQuestion = async (req, res) => {
    const questionId = req.params.id;
    const { title, problem, tags } = req.body;
    if (!await isValid(questionId, res)) return;

    // Update the question in the database
    const tagsArray = tags ? tags.split(",").map(t => t.trim()) : [];
    const updated = await updateQuestion(questionId, {
        title,
        problem,
        tags: tagsArray,
        userId: req.user._id
    });

    if (!updated?.modifiedCount) return res.status(500).send("Failed to update question");

    res.redirect(`/questions/${questionId}`);
};

const deleteAQuestion = async (req, res) => {
    const questionId = req.params.id;
    if (!await isValid(questionId, res)) return;

    // Delete the question and redirect to the questions page
    await deleteQuestion(questionId);
    res.redirect("/questions");
};

const getAllQuestionsHandler = async (req, res) => {
    const { sort, tag } = req.query;
    let questions = await getAllQuestions();

    // Filter by tag
    if (tag) {
        questions = questions.filter(q => q.tags.includes(tag));
    }

    // Sort
    if (sort === "Most Recent") {
        questions.sort((a, b) => new Date(b.created) - new Date(a.created));
    } else if (sort === "Hot") {
        questions.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
    }

    res.render("questions", { questions, user: req.user, query: req.query });
};

const getQuestionByIdHandler = async (req, res) => {
    const questionId = req.params.id;
    if (!await isValid(questionId, res)) return;
    const question = await getQuestionById(questionId);

    // Render an individual question page
    res.render("question_single", { question, user: req.user });
};

// 3. Answer functions
const addAnAnswer = async (req, res) => {
    const questionId = req.params.id;
    const { answer } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(userId)) return res.status(400).send("Invalid user ID");

    // Add the answer to the question in the database
    const updated = await updateQuestion(questionId, {
        $push: {
            answers: {
                _id: new ObjectId(),
                body: answer,
                userId: toObjectId(userId),
                username: req.user.username,
                created: new Date()
            }
        }
    });

    if (!updated?.modifiedCount) return res.status(500).send("Failed to add answer");

    res.redirect(`/questions/${questionId}`);
};

const editAnAnswer = async (req, res) => {
    const { id: questionId, answerId } = req.params;
    const { updatedAnswer } = req.body;
    const userId = req.user._id;

    if (!await isValid(questionId, res)) return;

    // Update the answer to the question in the database
    const updated = await updateQuestion(questionId, {
        $setAnswer: {
            answerId: toObjectId(answerId),
            userId: toObjectId(userId),
            newBody: updatedAnswer
        }
    });

    if (!updated?.modifiedCount) return res.status(500).send("Failed to update answer");

    res.redirect(`/questions/${questionId}`);
};

const deleteAnAnswer = async (req, res) => {
    const { id: questionId, answerId } = req.params;
    const userId = req.user._id;

    const result = await deleteAnswer(questionId, answerId, userId);
    if (!result?.modifiedCount) return res.status(500).send("Failed to delete answer");

    res.redirect(`/questions/${questionId}`);
};

// 4. Upvote/Downvote functions
const voteOnQuestion = async (req, res) => {
    const questionId = req.params.id;
    const userId = req.user._id;
    const voteType = req.body.voteType;

    if (!['up', 'down'].includes(voteType)) return res.status(400).send("Invalid vote type");

    const result = await toggleVoteOnQuestion(questionId, userId, voteType);
    if (!result?.modifiedCount) return res.status(400).send("Unable to process vote");

    res.redirect(`/questions/${questionId}`);
};

const voteOnAnswer = async (req, res) => {
    const { id: questionId, answerId } = req.params;
    const userId = req.user._id;
    const voteType = req.body.voteType;

    if (!['up', 'down'].includes(voteType)) return res.status(400).send("Invalid vote type");

    const result = await toggleVoteOnAnswer(questionId, answerId, userId, voteType);
    if (!result?.modifiedCount) return res.status(400).send("Unable to process answer vote");

    res.redirect(`/questions/${questionId}`);
};

// Helper function to check if a question ID and question is valid
const isValid = async (questionId, res) => {
    if (!isValidObjectId(questionId)) {
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
    voteOnAnswer
};