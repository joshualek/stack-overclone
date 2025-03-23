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

const login = async (req, res) => {
    // Logic for login
};

const logout = async (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};

const getUserProfile = async (req, res) => {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) return res.status(400).send("Invalid user ID");

    const user = await getUserById(userId);
    if (!user) return res.status(404).send("User not found");

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

    res.render("user_profile", { user, loggedInUser: req.user, error: null });
};

const addAUser = async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await getUserByUsername(username);
    if (existingUser) return res.status(400).send("User already exists, please login or choose a new username");
    const newUser = await insertUser({ username, password });
    req.session.userId = newUser._id;
    res.redirect("/");
};

const editUserProfile = async (req, res) => {
    const userId = req.params.id;
    const loggedInUserId = req.user?._id;

    if (!loggedInUserId || loggedInUserId.toString() !== userId) {
        return res.status(403).send("Unauthorized");
    }

    const updates = {};

    if (req.body.username) updates.username = req.body.username.trim();
    if (req.body.email) updates.email = req.body.email.trim();
    if (req.body.password) updates.password = req.body.password.trim();
    if (req.body.bio) updates.bio = req.body.bio.trim();
    if (req.file) updates.profilePic = `/uploads/${req.file.filename}`;

    try {
        await updateUser(userId, updates);
        res.redirect(`/users/${userId}`);
    } catch (error) {
        console.error("Error updating user:", error);

        let errorMessage = "An error occurred during update. Please use a different username/email.";
        if (error.type === "USERNAME_TAKEN") {
            errorMessage = "The username is already taken.";
        } else if (error.type === "EMAIL_TAKEN") {
            errorMessage = "The email is already taken.";
        }
        res.status(400).render("user_profile", {
            user: await getUserById(userId),
            loggedInUser: req.user,
            error: errorMessage ? errorMessage : null,
        });
    }
};

const deleteAUser = async (req, res) => {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
        return res.status(400).send("Invalid user ID");
    }
    try {
        await deleteUser(userId);
        res.redirect("/users");
    } catch (error) {
        res.status(500).send("Error deleting user: " + error.message);
    }
};

const getAllUsersHandler = async (req, res) => {
    const users = await getAllUsers();
    res.render("users", { users });
};

const getAUser = async (req, res) => {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
        return res.status(400).send("Invalid user ID");
    }
    const user = await getUserById(userId);
    if (!user) return res.status(404).send("User not found");
    res.render("user", { user });
};

module.exports = {
    login,
    logout,
    getUserProfile,
    editUserProfile,
    addAUser,
    deleteAUser,
    getAllUsersHandler,
    getAUser,
};
