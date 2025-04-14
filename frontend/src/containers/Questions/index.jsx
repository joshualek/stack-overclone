import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import QuestionCard from "../../components/QuestionCard";
import Filters from "../../components/Filters";
import "../../styles/style.css";

const Questions = ({ user }) => {
    const [searchParams] = useSearchParams();
    const [questions, setQuestions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const sort = searchParams.get("sort") || "";
    const tag = searchParams.get("tag") || "";

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://localhost:3000/api/questions");
                const allQuestions = await res.json();

                let filtered = [...allQuestions];

                if (tag) {
                    filtered = filtered.filter((q) => q.tags.includes(tag));
                }

                if (sort === "recent") {
                    filtered.sort(
                        (a, b) => new Date(b.created) - new Date(a.created),
                    );
                } else if (sort === "hot") {
                    filtered.sort(
                        (a, b) =>
                            (b.upvotes?.length || 0) - (a.upvotes?.length || 0),
                    );
                }

                setQuestions(filtered);
            } catch (err) {
                console.error("Failed to fetch questions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [tag, sort]);

    useEffect(() => {
        fetch("http://localhost:3000/api/users")
            .then((res) => res.json())
            .then(setUsers)
            .catch((err) => console.error("Error fetching users:", err));
    }, []);

    const userMap = {};
    users.forEach((u) => {
        userMap[u._id.toString()] = u;
    });

    return (
        <main className="container-lg">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>All Questions</h1>
                {user ? (
                    <Link
                        to="/questions/ask"
                        className="btn btn-primary btn-lg rounded-pill"
                    >
                        Ask Question
                    </Link>
                ) : (
                    <Link
                        to="/login"
                        className="btn btn-primary btn-lg rounded-pill"
                    >
                        Login to Ask Question
                    </Link>
                )}
            </div>

            <Filters />

            <div className="row">
                <div className="col-md-12">
                    {loading ? (
                        <p className="text-muted">Loading...</p>
                    ) : questions.length > 0 ? (
                        questions.map((q) => (
                            <QuestionCard
                                key={q._id}
                                question={q}
                                userMap={userMap}
                            />
                        ))
                    ) : (
                        <p className="text-muted">No questions found.</p>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Questions;
