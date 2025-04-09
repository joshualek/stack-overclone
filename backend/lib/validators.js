const { ObjectId } = require("mongodb");

// Checks if a given value is a valid MongoDB ObjectId
function isValidObjectId(id) {
  try {
    return ObjectId.isValid(id) && (new ObjectId(id)).toString() === id.toString();
  } catch (e) {
    return false;
  }
}

// Converts a string to ObjectId if valid, otherwise returns null
function toObjectId(id) {
  return isValidObjectId(id) ? new ObjectId(id) : null;
}

// Checks if two user IDs refer to the same user
function isSameUser(id1, id2) {
  return id1?.toString() === id2?.toString();
}

// Checks if a userId exists in an array of ObjectIds
function hasUserVoted(array, userId) {
  return (array || []).some(id => id.toString() === userId.toString());
}

module.exports = {
  isValidObjectId,
  toObjectId,
  isSameUser,
  hasUserVoted
};