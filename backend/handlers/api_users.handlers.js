const { toObjectId, isValidObjectId } = require("../lib/validators");
const {
    insertUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById,
    getUserByUsername,
    getAllQuestions,
    getQuestionById,
} = require("../lib/database");
const { editUserProfile } = require("./users.handlers");

const logout = async (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
}

const getUserProfileJSON = async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) res.status(404).json({ error: "User not found" });

    // Fetch questions that the user asked
    const questions = user.questions 
        ? await Promise.all(
            user.questions.map(async (qid) => await getQuestionById(qid))
        )
        : [];
    user.questions = questions.filter((q) => q !== null);
    // Fetch questions that the user answered
    const allQuestions = await getAllQuestions();
    const userAnswers = allQuestions.filter((q) =>
        q.answers?.some((ans) => ans.userId.toString() === user._id.toString())
    );
    user.answers = userAnswers.map((q) => ({
        question: {
            _id: q._id,
            title: q.title,
            problem: q.problem,
            tags: q.tags,
            created: q.created,
            upvotes: q.upvotes,
            downvotes: q.downvotes,
            userId: q.userId,
            username: q.username,
        },
        answers: q.answers.filter((ans) => ans.userId.toString() === user._id.toString())
    }));
    res.json(user);
}

const addAUserJSON = async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await getUserByUsername(username);
    if (existingUser) return res.status(400).json({ error: "User already exists, please login or choose a new username" });
    const newUser = await insertUser({ username, password });
    req.session.userId = newUser._id;
    res.json({ success: true, message: "User created successfully", user: newUser });
};

const editUserProfileJSON = async (req, res) => {
    if (!user) res.status(404).json({ error: "User not found" });

    // Check if the logged-in user is the same as the user being edited
    if (req.user._id.toString() !== user._id.toString()) {
        return res.status(403).json({ error: "You are not authorized to edit this profile" });
    }
    const updates = {};

    if (req.body.username) updates.username = req.body.username.trim();
    if (req.body.email) updates.email = req.body.email.trim();
    if (req.body.password) updates.password = req.body.password.trim();
    if (req.body.bio) updates.bio = req.body.bio.trim();
    if (req.file) updates.profilePic = `/uploads/${req.file.filename}`;

    try {
        await updateUser(userId, updates);
        res.json({ success: true, message: "User profile updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error);

        let errorMessage = "An error occurred during update. Please use a different username/email.";
        if (error.type === "USERNAME_TAKEN") {
            errorMessage = "The username is already taken.";
        } else if (error.type === "EMAIL_TAKEN") {
            errorMessage = "The email is already taken.";
        }
        res.status(400).json({
            success: false,
            error: errorMessage ? errorMessage : "An unknown error occurred",
        });
    }

}



module.exports = {
    getUserProfileJSON,
    editUserProfileJSON,
};