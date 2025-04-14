const { toObjectId, isValidObjectId } = require("../lib/validators");
const {
    insertUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    getAllQuestions,
    getQuestionById,
} = require("../lib/database");
const { editUserProfile, login } = require("./users.handlers");
const jwt = require("jsonwebtoken");
const { get } = require("../routes/users.routes");
const JWT_SECRET = "SECRET_STRING";

const loginHandler = async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);

    console.log("Login attempt:", username, password)
    console.log("Found user:", user)

    if (user && user.password === password) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "12h" });
        res.json({ accessToken: token });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
};

const forgotPasswordHandler = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await updateUser(user._id.toString(), { password });
        res.json({ message: "Password reset successful" });

    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "An error occurred while resetting the password" });
    }
}

const registerHandler = async (req, res) => {
    const { username, email, password } = req.body;

    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
    }

    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = await insertUser({ username, email, password });
    return res.status(201).json({ message: "User registered successfully", userId: newUser._id });
};


const getAllUsersJSON = async (req, res) => {
    const users = await getAllUsers();
    if (!users) res.status(404).json({ error: "No users found" });
    res.json(users);
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

const editUserProfileJSON = async (req, res) => {
    const userId = req.params.id;
    const user = await getUserById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if the logged-in user matches the profile being edited
    if (req.user._id.toString() !== userId) {
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

        let errorMessage = "An error occurred during update.";
        if (error.type === "USERNAME_TAKEN") errorMessage = "The username is already taken.";
        else if (error.type === "EMAIL_TAKEN") errorMessage = "The email is already taken.";

        res.status(400).json({
            success: false,
            error: errorMessage,
        });
    }
};



module.exports = {
    loginHandler,
    forgotPasswordHandler,
    registerHandler,
    getAllUsersJSON,
    getUserProfileJSON,
    editUserProfileJSON,
};