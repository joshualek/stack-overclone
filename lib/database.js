const { MongoClient, ObjectId } = require("mongodb");
const { isValidObjectId, toObjectId, hasUserVoted } = require("./validators");

let client;
let db;
let collectionUsers;
let collectionQuestions;

async function seedDummyData() {
  const userNames = ["alice", "bob", "charlie", "diana", "edward"];
  const tags = ["javascript", "node", "mongodb", "express", "ejs", "html", "css"];
  const userIds = userNames.map(() => new ObjectId());

  const users = userNames.map((name, i) => ({
    _id: userIds[i],
    username: name,
    email: `${name}@gmail.com`,
    password: "user",
    created: new Date(),
    questions: [],
    bio: `Hello, I'm ${name}!`,
    profilePic: ""
  }));

  const questions = [];

  for (let i = 0; i < 6; i++) {
    const uid = userIds[i % userIds.length];
    const username = userNames[i % userNames.length];
    const questionId = new ObjectId();
    const tagsSample = tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);

    const question = {
      _id: questionId,
      title: `Sample Question ${i + 1}`,
      problem: `This is the body of sample question ${i + 1}.`,
      tags: tagsSample,
      userId: uid,
      username,
      created: new Date(),
      answers: [],
      upvotes: [],
      downvotes: []
    };

    // Add random answers
    const answerCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < answerCount; j++) {
      const answererIndex = Math.floor(Math.random() * users.length);
      const answer = {
        _id: new ObjectId(),
        body: `This is an answer by ${userNames[answererIndex]} for question ${i + 1}.`,
        userId: userIds[answererIndex],
        username: userNames[answererIndex],
        created: new Date(),
        upvotes: [],
        downvotes: []
      };
      question.answers.push(answer);
    }

    questions.push(question);
    const author = users.find(u => u._id.equals(uid));
    if (author) author.questions.push(questionId);
  }

  await collectionUsers.insertMany(users);
  await collectionQuestions.insertMany(questions);
}

async function initDBIfNecessary() {
    if (!client) {
      client = new MongoClient("mongodb://127.0.0.1:27017");
      await client.connect();
      db = client.db("stack-overclone");
      collectionUsers = db.collection("users");
      collectionQuestions = db.collection("questions");
  
      // Only seed if both collections are empty
      const userCount = await collectionUsers.countDocuments();
      const questionCount = await collectionQuestions.countDocuments();
  
      if (userCount === 0 && questionCount === 0) {
        console.log("🌱 Seeding initial dummy data...");
        await seedDummyData();
      }
    }
  }  

// Getter functions
async function getUserById(userId) {
    await initDBIfNecessary();
    const _id = toObjectId(userId);
    if (!_id) return null;
    return await collectionUsers.findOne({ _id });
}

async function getUserByEmail(email) {
    await initDBIfNecessary();
    return await collectionUsers.findOne({ email });
}

async function getUserByUsername(username) {
    await initDBIfNecessary();
    return await collectionUsers.findOne({ username });
}

async function getAllQuestions() {
    await initDBIfNecessary();
    return await collectionQuestions.find().sort({ created: -1 }).toArray();
}

async function getQuestionById(questionId) {
    await initDBIfNecessary();
    const _id = toObjectId(questionId);
    if (!_id) return null;
    return await collectionQuestions.findOne({ _id });
}

async function insertUser(userData) {
    await initDBIfNecessary();
    const result = await collectionUsers.insertOne(userData);
    return { ...userData, _id: result.insertedId };
}

async function updateUser(userId, updates) {
    await initDBIfNecessary();
    const userObjectId = new ObjectId(userId);
  
    // Validate uniqueness of username/email if changed
    if (updates.username) {
      const existing = await collectionUsers.findOne({
        username: updates.username,
        _id: { $ne: userObjectId }
      });
      if (existing) {
        const err = new Error("Username already taken");
        err.type = "USERNAME_TAKEN";
        throw err;
      };
    }
  
    if (updates.email) {
      const existing = await collectionUsers.findOne({
        email: updates.email,
        _id: { $ne: userObjectId }
      });
      if (existing) {
        const err = new Error("Email already taken");
        err.type = "EMAIL_TAKEN";
        throw err;
      }
    }
  
    const { modifiedCount } = await collectionUsers.updateOne(
      { _id: userObjectId },
      { $set: updates }
    );
    return modifiedCount > 0;
  }
  

// =====Questions & Answers Functions=====
async function insertQuestion(question) {
    await initDBIfNecessary();
    const result = await collectionQuestions.insertOne(question);
    const questionId = result.insertedId;

    // Update user document
    const userId = toObjectId(question.userId);
    if (!userId) return null;
    await collectionUsers.updateOne(
        { _id: userId },
        { $addToSet: { questions: questionId } }
    );

    return { ...question, _id: questionId };
}

async function updateQuestion(questionId, updateData) {
    await initDBIfNecessary();
    const _id = toObjectId(questionId);
    if (!_id) return { modifiedCount: 0 };

    // Case 1: Editing question fields (title/problem/tags)
    if (updateData.title || updateData.problem || updateData.tags) {
        const userId = toObjectId(updateData.userId);
        const result = await collectionQuestions.updateOne(
            { _id },
            { $set: updateData }
        );

        // Update user.questions if needed
        if (userId) {
            const alreadyLinked = await collectionUsers.findOne({ _id: userId, questions: _id });
            if (!alreadyLinked) {
                await collectionUsers.updateOne(
                    { _id: userId },
                    { $addToSet: { questions: _id } }
                );
            }
        }

        return result;
    }

    // Case 2: Adding an answer
    if (updateData.$push) {
        return await collectionQuestions.updateOne(
            { _id },
            updateData
        );
    }

    // Case 3: Editing an answer
    if (updateData.$setAnswer) {
        const { answerId, userId, newBody } = updateData.$setAnswer;
        return await collectionQuestions.updateOne(
            {
                _id,
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
    const _id = toObjectId(questionId);
    if (!_id) return;

    // Remove the question
    await collectionQuestions.deleteOne({ _id });

    // Also remove from user.questions
    await collectionUsers.updateMany(
        {},
        { $pull: { questions: _id } }
    );
}

async function deleteAnswer(questionId, answerId, userId) {
    await initDBIfNecessary();
    const qId = toObjectId(questionId);
    const aId = toObjectId(answerId);
    const uId = toObjectId(userId);
    if (!qId || !aId || !uId) return { modifiedCount: 0 };

    return await collectionQuestions.updateOne(
        { _id: qId },
        {
            $pull: {
                answers: {
                    _id: aId,
                    userId: uId
                }
            }
        }
    );
}

// =====Vote Functions=====
async function toggleVoteOnQuestion(questionId, userId, voteType) {
    await initDBIfNecessary();
    const _id = toObjectId(questionId);
    const uId = toObjectId(userId);
    if (!_id || !uId) return null;

    const question = await collectionQuestions.findOne({ _id });
    if (!question) return null;

    if (question.userId.toString() === userId.toString()) return null;

    const hasUpvoted = hasUserVoted(question.upvotes, userId);
    const hasDownvoted = hasUserVoted(question.downvotes, userId);

    if (voteType === "up") {
        if (hasUpvoted) { // Toggle off upvote
            return await collectionQuestions.updateOne({ _id }, { $pull: { upvotes: uId } });
        } else { // Switch from downvote to upvote or just upvote
            return await collectionQuestions.updateOne(
                { _id },
                {
                    $addToSet: { upvotes: uId },
                    $pull: { downvotes: uId }
                }
            );
        }
    }

    if (voteType === "down") {
        if (hasDownvoted) { // Toggle off downvote
            return await collectionQuestions.updateOne({ _id }, { $pull: { downvotes: uId } });
        } else { // Switch from upvote to downvote or just downvote
            return await collectionQuestions.updateOne(
                { _id },
                {
                    $addToSet: { downvotes: uId },
                    $pull: { upvotes: uId }
                }
            );
        }
    }

    return null;
}

async function toggleVoteOnAnswer(questionId, answerId, userId, voteType) {
    await initDBIfNecessary();
    const qId = toObjectId(questionId);
    const aId = toObjectId(answerId);
    const uId = toObjectId(userId);
    if (!qId || !aId || !uId) return null;

    const question = await collectionQuestions.findOne({ _id: qId });
    if (!question) return null;

    const answer = question.answers?.find(ans => ans._id.toString() === aId.toString());
    if (!answer || answer.userId.toString() === userId.toString()) return null;

    const hasUpvoted = hasUserVoted(answer.upvotes, userId);
    const hasDownvoted = hasUserVoted(answer.downvotes, userId);

    if (voteType === "up") {
        if (hasUpvoted) { // Toggle off upvote
            return await collectionQuestions.updateOne(
                { _id: qId, "answers._id": aId },
                { $pull: { "answers.$.upvotes": uId } }
            );
        } else { // Switch from downvote to upvote or just upvote
            return await collectionQuestions.updateOne(
                { _id: qId, "answers._id": aId },
                {
                    $addToSet: { "answers.$.upvotes": uId },
                    $pull: { "answers.$.downvotes": uId }
                }
            );
        }
    }

    if (voteType === "down") {
        if (hasDownvoted) { // Toggle off downvote
            return await collectionQuestions.updateOne(
                { _id: qId, "answers._id": aId },
                { $pull: { "answers.$.downvotes": uId } }
            );
        } else { // Switch from upvote to downvote or just downvote
            return await collectionQuestions.updateOne(
                { _id: qId, "answers._id": aId },
                {
                    $addToSet: { "answers.$.downvotes": uId },
                    $pull: { "answers.$.upvotes": uId }
                }
            );
        }
    }

    return null;
}

module.exports = {
    initDBIfNecessary,
    getUserById,
    getUserByEmail,
    getUserByUsername,
    insertUser,
    updateUser,
    getAllQuestions,
    getQuestionById,
    insertQuestion,
    updateQuestion,
    deleteQuestion,
    deleteAnswer,
    toggleVoteOnQuestion,
    toggleVoteOnAnswer
};