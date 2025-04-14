const { ObjectId } = require("mongodb");
const {
    getUserById,
    insertQuestion,
    updateQuestion,
    deleteQuestion,
    deleteAnswer,
    getAllQuestions,
    getQuestionById,
    toggleVoteOnQuestion,
    toggleVoteOnAnswer,
} = require("../lib/database");

const {
    isValidObjectId,
    toObjectId,
    isSameUser
} = require("../lib/validators");

// Getters
const getAllQuestionsHandlerJSON = async (req, res) => {
    const { sort, tag } = req.query;
    let questions = await getAllQuestions();
    res.json(questions);
};

const getQuestionByIdHandlerJSON = async (req, res) => {
    const questionId = req.params.id;
    const question = await getQuestionById(questionId);

    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }

    // Fetch user details for each answer
    const answers = question.answers || [];
    const answersWithUserDetails = await Promise.all(
        answers.map(async (answer) => {
            const user = await getUserById(answer.userId);
            return {
                ...answer,
                username: user?.username || "deleted account",
                profilePic: user?.profilePic || null,
            };
        })
    );
    question.answers = answersWithUserDetails;
    res.json(question);
};

// 2. Question functions
const addAQuestionJSON = async (req, res) => {
    try {
        const { title, body, tags, created, username } = req.body;
        const user = req.user;

        if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required." });
        }

        const question = {
            title,
            problem: body,
            tags: Array.isArray(tags) ? tags : [],
            userId: user._id,
            username: username || user.username,
            created: created ? new Date(created) : new Date(),
            answers: [],
            upvotes: [],
            downvotes: [],
        };

        const result = await insertQuestion(question);
        res.status(201).json({ success: true, message: "Question added", questionId: result._id });
    } catch (err) {
        console.error("Error adding question:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const editAQuestionJSON = async (req, res) => {
    try {
        const { title, body, tags, created, username } = req.body;
        const questionId = req.params.id;

        if (!title || !body) {
            return res.status(400).json({ message: "Title and body are required." });
        }

        const updates = {
            title,
            problem: body,
            tags: Array.isArray(tags) ? tags : [],
            created: created ? new Date(created) : new Date(),
            username: username || req.user?.username || "unknown",
        };

        const result = await updateQuestion(questionId, updates);

        if (result.modifiedCount > 0) {
            res.json({ success: true, message: "Question updated" });
        } else {
            res.status(404).json({ message: "Question not found or unchanged" });
        }
    } catch (err) {
        console.error("Error editing question:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
const deleteAQuestionJSON = async (req, res) => {
    try {
        const questionId = req.params.id;
        const userId = req.user._id;

        const question = await getQuestionById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        if (question.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await deleteQuestion(questionId);
        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// 3. Answer functions
const addAnAnswerJSON = async (req, res) => {
    try {
        const questionId = req.params.id;
        const { title, body, tags, created, username } = req.body;
        const user = req.user;

        if (!body || body.trim() === "") {
            return res.status(400).json({ message: "Answer body is required." });
        }

        const answer = {
            _id: new ObjectId(),
            body,
            title: title || "",
            tags: Array.isArray(tags) ? tags : [],
            created: created ? new Date(created) : new Date(),
            userId: user._id,
            username: username || user.username,
            upvotes: [],
            downvotes: [],
        };

        const result = await updateQuestion(questionId, { $push: { answers: answer } });

        if (result.modifiedCount > 0) {
            res.status(201).json({ success: true, message: "Answer added", answerId: answer._id });
        } else {
            res.status(404).json({ message: "Question not found" });
        }
    } catch (err) {
        console.error("Error adding answer:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const editAnAnswerJSON = async (req, res) => {
    try {
        const questionId = req.params.id;
        const answerId = req.params.answerId;
        const userId = req.user._id;

        const { body, title, tags } = req.body;

        if (!questionId || !answerId || !body) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await updateQuestion(questionId, {
            $setAnswer: {
                answerId: toObjectId(answerId),
                userId: toObjectId(userId),
                newBody: body,
                newTitle: title,
                newTags: Array.isArray(tags) ? tags : []
            }
        });

        if (!result || result.modifiedCount === 0) {
            return res.status(500).json({ message: "Failed to update answer" });
        }

        res.status(200).json({ message: "Answer updated successfully" });
    } catch (error) {
        console.error("Error updating answer:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteAnAnswerJSON = async (req, res) => {
    try {
        const questionId = req.params.id;
        const answerId = req.params.answerId;
        const userId = req.user._id;

        const question = await getQuestionById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const answer = question.answers.find(
            (a) => a._id.toString() === answerId && a.userId.toString() === userId.toString()
        );
        if (!answer) {
            return res.status(403).json({ message: "Unauthorized or answer not found" });
        }

        const result = await deleteAnswer(questionId, answerId, userId);
        if (result.modifiedCount === 0) {
            return res.status(500).json({ message: "Failed to delete answer" });
        }

        res.status(200).json({ message: "Answer deleted successfully" });
    } catch (error) {
        console.error("Error deleting answer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// 4. Upvote/Downvote functions
const voteOnQuestionJSON = async (req, res) => {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.user._id;

    try {
        const result = await toggleVoteOnQuestion(id, userId, voteType);
        if (!result) return res.status(400).json({ message: "Invalid vote" });

        res.json({ message: "Vote recorded", result });
    } catch (err) {
        console.error("Error voting on question:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const voteOnAnswerJSON = async (req, res) => {
    const { id: questionId, answerId } = req.params;
    const { voteType } = req.body;
    const userId = req.user._id;

    try {
        const result = await toggleVoteOnAnswer(questionId, answerId, userId, voteType);
        if (!result) return res.status(400).json({ message: "Invalid vote" });

        res.json({ message: "Vote recorded", result });
    } catch (err) {
        console.error("Error voting on answer:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};



// Helper function to check if a question ID and question is valid
const isValid = async (questionId, res) => {
    if (!isValidObjectId(questionId)) {
        res.status(404).json({ message: "Invalid question ID" });
        return false;
    }
    const question = await getQuestionById(questionId);
    if (!question) {
        res.status(404).json({ message: "Question not found" });
        return false;
    }
    return true;
};

module.exports = {
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
}