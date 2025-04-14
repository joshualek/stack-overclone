const express = require("express");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const { getUserById } = require("./lib/database");

// Express app
const app = express();
const port = 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session
app.use(
    session({
        secret: "SOME SECRET KEY",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false, //setting this false for http connections
        },
    })
);

// enable cors
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

// Middleware
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(async (req, res, next) => {
    if (req.session.userId) {
        try {
            // Fetch the user from the DB using the stored session ID
            const user = await getUserById(req.session.userId);
            // Attach it to req and res.locals so all templates have access to it
            req.user = user;
            res.locals.user = user;
        } catch (error) {
            console.error("Error fetching user:", error);
            req.user = null;
            res.locals.user = null;
        }
    } else {
        req.user = null;
        res.locals.user = null;
    }
    next();
});

// Routes
const apiUsersRoutes = require("./routes/api_users.routes");
app.use("/api/users", apiUsersRoutes);

const apiQuestionsRoutes = require("./routes/api_questions.routes");
app.use("/api/questions", apiQuestionsRoutes);

app.use("/api", require("./routes/api_misc.routes"));



app.get("/", (req, res) => {
    res.render("main");
});

// Authentication
const { loginHandler, forgotPasswordHandler, registerHandler } = require("./handlers/api_users.handlers");
app.post("/api/login", loginHandler);
app.post("/api/doforgotpassword", forgotPasswordHandler);
app.post("/api/register", registerHandler);

app.listen(port, () => {
    console.log(`Stack Overclone listening at http://localhost:${port}`);
});