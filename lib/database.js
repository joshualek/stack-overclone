const { MongoClient, ObjectId } = require("mongodb");

let client = null;

//this is the collection object for querying the collection in the database 
let collectionUsers = null;
let collectionQuestions = null;

//function to connect to db and get the collection object 
async function initDBIfNecessary() {
    if (!client) {
        //only connect to the database if we are not already connected 
        client = await MongoClient.connect("mongodb://localhost:27017");

        const db = client.db("stack-overclone");
        collectionUsers = db.collection("users");
        collectionQuestions = db.collection("questions");

    }
}

//function to disconnect from the database 
async function disconnect() {
    if (client) {
        await client.close();
        client = null;
    }
}

async function insertUser(user) {
    await initDBIfNecessary();
    user.created = new Date();
    const newUser = await collectionUsers.insertOne(user);
    user._id = newUser.insertedId.toString();
    return user;
}

// User Functions
async function updateUser(userId, userData) {
    await initDBIfNecessary();

    console.log("Updating user:", userId);
    console.log("Received data:", userData);

    const { username, email, password, profilePic } = userData;

    const currentUser = await collectionUsers.findOne({ _id: ObjectId.createFromHexString(userId) });
    if (!currentUser) {
        throw new Error("User not found");
    }

    if (username && username !== currentUser.username) {
        let existingUser = await collectionUsers.findOne({ username });
        if (existingUser) {
            throw new Error("Username already exists");
        }
    }

    if (email && email !== currentUser.email) {
        let existingUser = await collectionUsers.findOne({ email });
        if (existingUser) {
            throw new Error("Email already exists");
        }
    }

    console.log("Final data to update:", userData);

    await collectionUsers.updateOne(
        { _id: ObjectId.createFromHexString(userId) },
        { $set: userData }
    );
}

async function deleteUser(userId) {
    await initDBIfNecessary();
    await collectionUsers.deleteOne({ _id: ObjectId.createFromHexString(userId) });
}

async function getAllUsers() {
    await initDBIfNecessary();
    return await collectionUsers.find().toArray();
}

async function getUserById(userId) {
    await initDBIfNecessary();

    if (!userId) {
        console.error("Please provide userId: ", typeof userId);
        return null;
    }

    // Handle both ObjectId and string formats
    if (typeof userId === "string" && ObjectId.isValid(userId)) {
        userId = ObjectId.createFromHexString(userId);
    }

    return await collectionUsers.findOne({ _id: userId });
}

async function getUserByUsername(username) {
    await initDBIfNecessary();
    const user = await collectionUsers.findOne({ username });
    if (!user) return null;
    return user;
}

async function getUserByEmail(email) {
    await initDBIfNecessary();
    const user = await collectionUsers.findOne({ email });
    if (!user) return null;
    return user;
}

// 3. Questions Functions
async function insertQuestion(question) {
    await initDBIfNecessary();
    question.created = new Date();

    // Update the question collection
    const newQuestion = await collectionQuestions.insertOne(question);
    question._id = newQuestion.insertedId.toString();

    // Update the users collection
    await collectionUsers.updateOne(
        { _id: new ObjectId(question.userId) },
        { $push: { questions: ObjectId.createFromHexString(question._id) } }
    );
    return question;
}

async function updateQuestion(questionId, updateData) {
    await initDBIfNecessary();
    const questionId_ = new ObjectId(questionId);

    // $set update for editing the question
    if (updateData.title || updateData.problem || updateData.tags) {
        const userId = new ObjectId(updateData.userId);
        // Update the question collection
        const updatedQuestion = await collectionQuestions.updateOne(
            { _id: questionId_ },
            { $set: updateData }
        );
        // Update the users collection if question is not already associated with the user
        const user = await collectionUsers.findOne({ _id: userId, questions: questionId_ });
        if (!user) {
            await collectionUsers.updateOne(
                { _id: userId },
                { $addToSet: { questions: questionId_ } }
            );
        }
        return updatedQuestion;
    }
    // $push update for adding an answer
    if (updateData.$push) {
        return await collectionQuestions.updateOne(
            { _id: questionId_ },
            updateData
        );
    }
    // $set update for editing an answer
    if (updateData.$setAnswer) {
        const { answerId, userId, newBody } = updateData.$setAnswer;

        return await collectionQuestions.updateOne(
            {
                _id: questionId_,
                "answers._id": answerId,
                "answers.userId": userId
            },
            {
                $set: {
                    "answers.$.body": newBody
                }
            }
        );
    }

    return null;
}

async function deleteQuestion(questionId) {
    await initDBIfNecessary();

    // Update the question collection
    await collectionQuestions.deleteOne({ _id: ObjectId.createFromHexString(questionId) });
    // Update the users collection
    await collectionUsers.updateMany(
        { questions: ObjectId.createFromHexString(questionId) },
        { $pull: { questions: ObjectId.createFromHexString(questionId) } }
    );
}

async function deleteAnswer(questionId, answerId, userId) {
    await initDBIfNecessary();
    const questionObjectId = new ObjectId(questionId);
    const answerObjectId = new ObjectId(answerId);
    const userObjectId = new ObjectId(userId);

    const result = await collectionQuestions.updateOne(
        {
            _id: questionObjectId,
            "answers._id": answerObjectId,
            "answers.userId": userObjectId, // ensures users can only delete their own answers
        },
        {
            $pull: { answers: { _id: answerObjectId } },
        }
    );

    return result;
}

// 4. Upvote/Downvote Function
async function toggleVoteOnQuestion(questionId_, userId_, voteType) {
    await initDBIfNecessary();
    const questionId = new ObjectId(questionId_);
    const userId = new ObjectId(userId_);

    const question = await collectionQuestions.findOne({ _id: questionId });
    if (!question) return null;

    // Prevent self-voting then check for an existing vote
    if (question.userId.toString() === userId.toString()) return null;
    const hasUpvoted = question.upvotes?.some(id => id.toString() === userId.toString());
    const hasDownvoted = question.downvotes?.some(id => id.toString() === userId.toString());

    // Toggle off upvote or downvote based on the user action and current state
    if (voteType === "up") {
        if (hasUpvoted) {
            // Toggle off upvote
            return await collectionQuestions.updateOne(
                { _id: questionId },
                { $pull: { upvotes: userId } }
            );
        } else {
            // Switch from downvote to upvote or just upvote
            const update = {
                $addToSet: { upvotes: userId },
                $pull: { downvotes: userId }
            };
            return await collectionQuestions.updateOne({ _id: questionId }, update);
        }
    } else if (voteType === "down") {
        if (hasDownvoted) {
            // Toggle off downvote
            return await collectionQuestions.updateOne(
                { _id: questionId },
                { $pull: { downvotes: userId } }
            );
        } else {
            // Switch from upvote to downvote or just downvote
            const update = {
                $addToSet: { downvotes: userId },
                $pull: { upvotes: userId }
            };
            return await collectionQuestions.updateOne({ _id: questionId }, update);
        }
    }

    return null;
}


async function toggleVoteOnAnswer(questionId_, answerId_, userId_, voteType) {
    await initDBIfNecessary();
    const questionId = new ObjectId(questionId_);
    const answerId = new ObjectId(answerId_);
    const userId = new ObjectId(userId_);

    const question = await collectionQuestions.findOne({ _id: questionId });
    if (!question) return null;

    const answer = question.answers.find(ans => ans._id.toString() === answerId.toString());
    if (!answer) return null;

    // Prevent self-voting then check for an existing vote
    if (answer.userId.toString() === userId.toString()) return null;
    const hasUpvoted = (answer.upvotes || []).some(id => id.toString() === userId.toString());
    const hasDownvoted = (answer.downvotes || []).some(id => id.toString() === userId.toString());

    if (voteType === "up") {
        if (hasUpvoted) {
            return await collectionQuestions.updateOne(
                { _id: questionId, "answers._id": answerId },
                { $pull: { "answers.$.upvotes": userId } }
            );
        } else {
            return await collectionQuestions.updateOne(
                { _id: questionId, "answers._id": answerId },
                {
                    $addToSet: { "answers.$.upvotes": userId },
                    $pull: { "answers.$.downvotes": userId }
                }
            );
        }
    }

    if (voteType === "down") {
        if (hasDownvoted) {
            return await collectionQuestions.updateOne(
                { _id: questionId, "answers._id": answerId },
                { $pull: { "answers.$.downvotes": userId } }
            );
        } else {
            return await collectionQuestions.updateOne(
                { _id: questionId, "answers._id": answerId },
                {
                    $addToSet: { "answers.$.downvotes": userId },
                    $pull: { "answers.$.upvotes": userId }
                }
            );
        }
    }

    return null;
}

// // 4a. Upvote/Downvote Questions
// async function addUpvoteToQuestion(questionId, userId) {
//     await initDBIfNecessary();
//     const question = await collectionQuestions.findOne({ _id: new ObjectId(questionId) });
//     // Prevent self-vote or invalid question
//     if (!question || question.userId.toString() === userId.toString()) {
//         return { modifiedCount: 0 };
//     }

//     return await collectionQuestions.updateOne(
//         {
//             _id: new ObjectId(questionId),
//             upvotes: { $ne: new ObjectId(userId) } // avoid duplicates
//         },
//         {
//             $addToSet: { upvotes: new ObjectId(userId) }
//         }
//     );
// }

// async function addDownvoteToQuestion(questionId, userId) {
//     await initDBIfNecessary();

//     const question = await collectionQuestions.findOne({ _id: new ObjectId(questionId) });
//     if (!question || question.userId.toString() === userId.toString()) {
//         return { modifiedCount: 0 }; // prevent self-vote
//     }

//     // Prevent double vote (same user can't upvote and downvote)
//     if (question.upvotes?.some(uid => uid.toString() === userId.toString())) {
//         return { modifiedCount: 0 };
//     }

//     return await collectionQuestions.updateOne(
//         {
//             _id: new ObjectId(questionId),
//             downvotes: { $ne: new ObjectId(userId) }
//         },
//         {
//             $addToSet: { downvotes: new ObjectId(userId) }
//         }
//     );
// }

// // 4b. Upvote/Downvote Answers
// async function addUpvoteToAnswer(questionId, answerId, userId) {
//     await initDBIfNecessary();

//     const question = await collectionQuestions.findOne({ _id: new ObjectId(questionId) });
//     if (!question) return { modifiedCount: 0 };

//     const answer = question.answers.find(a => a._id.toString() === answerId.toString());
//     if (!answer || answer.userId.toString() === userId.toString()) {
//         return { modifiedCount: 0 }; // Prevent self-voting
//     }

//     if (answer.upvotes && answer.upvotes.find(uid => uid.toString() === userId.toString())) {
//         return { modifiedCount: 0 }; // Already upvoted
//     }

//     // Add upvote to specific answer
//     return await collectionQuestions.updateOne(
//         {
//             _id: new ObjectId(questionId),
//             "answers._id": new ObjectId(answerId)
//         },
//         {
//             $addToSet: { "answers.$.upvotes": new ObjectId(userId) }
//         }
//     );
// }

// async function addDownvoteToAnswer(questionId, answerId, userId) {
//     await initDBIfNecessary();

//     const question = await collectionQuestions.findOne({ _id: new ObjectId(questionId) });
//     if (!question) return { modifiedCount: 0 };

//     const answer = question.answers.find(a => a._id.toString() === answerId.toString());
//     if (!answer || answer.userId.toString() === userId.toString()) {
//         return { modifiedCount: 0 };
//     }

//     const alreadyUpvoted = answer.upvotes?.some(uid => uid.toString() === userId.toString());
//     const alreadyDownvoted = answer.downvotes?.some(uid => uid.toString() === userId.toString());
//     if (alreadyUpvoted || alreadyDownvoted) return { modifiedCount: 0 };

//     return await collectionQuestions.updateOne(
//         {
//             _id: new ObjectId(questionId),
//             "answers._id": new ObjectId(answerId)
//         },
//         {
//             $addToSet: { "answers.$.downvotes": new ObjectId(userId) }
//         }
//     );
// }



// Helper functions for questions

async function getAllQuestions() {
    await initDBIfNecessary();
    return await collectionQuestions.find().toArray();
}

async function getQuestionById(questionId) {
    await initDBIfNecessary();
    // Handle both ObjectId and string formats

    if (typeof questionId === "string" && ObjectId.isValid(questionId)) {
        questionId = ObjectId.createFromHexString(questionId);
    }
    return await collectionQuestions.findOne({ _id: questionId });
}


//export the functions so they can be used in other files 
module.exports = {
    disconnect,
    insertUser,
    updateUser,
    deleteUser,
    getAllUsers,
    getUserById,
    getUserByUsername,
    getUserByEmail,
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
    getQuestionById,
};