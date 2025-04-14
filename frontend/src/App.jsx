import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import Main from "./layouts/Main";
import Home from "./containers/Home";
import Questions from "./containers/Questions";
import Login from "./containers/Login";
import Register from "./containers/Register";
import ProfilePage from "./containers/ProfilePage";
import AskQuestion from "./containers/AskQuestion";
import QuestionSingle from "./containers/QuestionSingle";
import "./styles/style.css";

function App() {
    const [user, setUser] = useState("");

    useEffect(() => {
        const handleStorage = () => {
            const token = localStorage.getItem("accesstoken");
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setUser({ _id: decoded.userId });
                } catch (err) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };
        // Check if user is logged in on initial load
        handleStorage();
        window.addEventListener("storage", handleStorage);
        return () => {
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    return (
        <>
            <Routes>
                <Route element={<Main user={user} setUser={setUser} />}>
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/questions" element={<Questions user={user} />} />
                    <Route path="/users/:id" element={<ProfilePage loggedInUser={user} />} />
                    <Route path="/questions/ask" element={<AskQuestion />} />
                    <Route path="/questions/:id" element={<QuestionSingle user={user} />} />
                </Route>

                {/* No navbar & footer for these pages */}
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </>

    );
}

export default App;
