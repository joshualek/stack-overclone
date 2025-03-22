const { ObjectId } = require("mongodb");
const { 
    insertUser, 
    updateUser, 
    deleteUser, 
    getAllUsers, 
    getUserById, 
    getUserByUsername, 
    getUserByEmail, 
    getAllQuestions,
    getQuestionById } = require("../lib/database");

const login = async (req, res) => {

}

const logout = async (req, res) => {

}

const getUserProfile = async (req, res) => {
    const userId = req.params.id;
    if (!ObjectId.isValid(userId)) { 
        return res.status(400).send("Invalid user ID");
    }
    const user = await getUserById(userId);
    if (!user) return res.status(404).send("User not found");

    // Fetch questions that the user asked
    const questions = user.questions ? 
        await Promise.all(user.questions.map(async (questionId) => {
        return await getQuestionById(questionId);
    })) : [];
    user.questions = questions.filter(q => q !== null);

    // Fetch questions that the user answered
    const allQuestions = await getAllQuestions();
    const userAnswers = allQuestions.filter(q => 
        q.answers && q.answers.some(ans => ans.userId.toString() === user._id.toString()));
    
    user.answers = userAnswers.map(q => ({
        question: { _id: q._id, title: q.title },
    }))

    res.render("user_profile", { user });
}

const addAUser = async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
        return res.status(400).send("User already exists, please login or choose a new username");
    }
    const newUser = await insertUser({ username, password });
    req.session.userId = newUser._id;
    res.redirect("/");

};

const editUserProfile = async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    const { username, email, password, bio, profilePic } = userData;

    if (!username || !email || !password) {
        return res.status(400).send("Please provide a username, email, and password");
    } else if (!bio) {
        return res.status(400).send("Please provide a bio");
    } else if (!profilePic) {
        return res.status(400).send("Please provide a profile picture");
    }

    try {
        await updateUser(userId, userData);
        res.redirect(`/users/${userId}`);
        return res.status(200).send("User updated successfully");
    } catch (error) {
        if (!res.headersSent) 
            return res.status(500).send("Error updating user: " + error.message);
    }    
}

const deleteAUser = async (req, res) => {

}

const getAllUsersHandler = async (req, res) => {
    const users = await getAllUsers();
    res.render("users", { users });
}

const getAUser = async (req, res) => {
    const user = await getUserById(req.params.id);
    res.render("user", { user });
}

module.exports = {
    login,
    logout,
    getUserProfile,
    editUserProfile,
    addAUser,
    deleteAUser,
    getAllUsersHandler,
    getAUser,
}