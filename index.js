const express = require("express");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const { insertUser, updateUser, getUserById, getUserByUsername, getUserByEmail } = require("./lib/database");

const { requireAuth } = require("./middleware/auth");

// Express app
const app = express();
const port = 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

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
const usersRouter = require("./routes/users.routes");
app.use("/users", usersRouter);

const questionsRouter = require("./routes/questions.routes");
app.use("/questions", questionsRouter);

// Authentication
app.get("/", (req, res) => {
    res.render("main");
});

app.get("/login", (req, res) => {
    const forgotPassword = req.query.forgotPassword === 'true';
    res.render("login", { forgotPassword });
})

app.post("/dologin", async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt-", { username, password });

    try {
        const foundUser = await getUserByUsername(username);
        if (foundUser) {
            console.log("Found user:", foundUser._id);
            if (foundUser.password === password) {
                req.session.userId = foundUser._id;
                console.log("Login successful");
                res.redirect("/");
            } else {
                console.log("Incorrect password");
                res.redirect("/login?error=Incorrect password");
            }
        } else {
            console.log("User not found");
            res.redirect("/login?error=User not found");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.redirect("/login?error=An error occurred");
    }
});

app.post("/doforgotpassword", async (req, res) => {
    const { username, password } = req.body;
    console.log("Forgot password attempt-", { username });
    
    const foundUser = await getUserByUsername(username);
    
    if (foundUser) {
        console.log("Found user:", foundUser._id);
        foundUser.password = password;
        await updateUser(foundUser._id.toString(), { password });

        console.log("Password reset successful");
        res.redirect("/login");
    } else {
        console.log("User not found");
        res.redirect("/login?error=User not found");
    }
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/doregister", async (req, res) => {
    const userData = req.body;
    console.log(`Register attempt- username: ${userData.username}, email: ${userData.email}, password: ${userData.password}`);

    // Check if the username already exists
    const existingUserByUsername = await getUserByUsername(userData.username);
    if (existingUserByUsername) {
        console.log("User already exists");
        res.redirect("/register?error=User already exists");
        return;
    }

    // Check if the email already exists
    const existingUserByEmail = await getUserByEmail(userData.email);
    if (existingUserByEmail) {
        console.log("Email already exists");
        res.redirect("/register?error=Email already exists");
        return;
    }

    // If both checks pass, insert the new user
    const newUser = await insertUser(userData);
    console.log("New user created:", newUser._id);
    req.session.userId = newUser._id;
    res.redirect("/");
});

app.get("/logout", (req, res) => {
    req.session.userId = null;
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Stack Overclone listening at http://localhost:${port}`);
});