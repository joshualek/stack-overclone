const express = require('express');
const router = express.Router();

function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect("/login");
    }
}

module.exports = {
    requireAuth,
};
