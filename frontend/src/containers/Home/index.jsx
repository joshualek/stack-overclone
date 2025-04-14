import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = ({ user }) => {

    const [stats, setStats] = useState({ users: 0, questions: 0, answers: 0 });

    useEffect(() => {
        fetch("http://localhost:3000/api/stats")
            .then((res) => res.json())
            .then(setStats)
            .catch((err) => console.error("Failed to load stats:", err));
    }, []);

    return (
        <>
            <main className="container text-center">
                {/* Hero Section */}
                <section className="mb-5">
                    <h1 className="display-4 fw-bold mb-3">
                        Welcome to Stack Overclone
                    </h1>
                    <p className="lead mb-4">
                        A collaborative Q&A platform for developers, students,
                        and tech enthusiasts. Ask questions, share knowledge,
                        and grow together.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        {!user ? (
                            <>
                                <Link
                                    to="/questions"
                                    className="btn btn-outline-secondary btn-lg rounded-pill"
                                >
                                    Browse Questions
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn btn-primary btn-lg rounded-pill"
                                >
                                    Join Now
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/questions"
                                className="btn btn-primary btn-lg rounded-pill"
                            >
                                Browse Questions
                            </Link>
                        )}
                    </div>
                </section>

                {/* Features  */}
                <section className="row text-start justify-content-center">
                    <div className="col-md-3">
                        <h4>🙋 Ask Anything</h4>
                        <p>
                            Have a technical problem or curious question? Post
                            it and get help from the community.
                        </p>
                    </div>
                    <div className="col-md-3">
                        <h4>💬 Share Your Knowledge</h4>
                        <p>
                            Answer questions, upvote good content, and earn
                            reputation as a helpful contributor.
                        </p>
                    </div>
                    <div className="col-md-3">
                        <h4>📊 Community Driven</h4>
                        <p>
                            Our platform grows with you. The more you engage,
                            the better your experience becomes.
                        </p>
                    </div>
                </section>

                {/* Footer CTA */}
                {!user && (
                    <section className="mb-5">
                        <p className="text-muted">Ready to dive in?</p>
                        <Link
                            to="/register"
                            className="btn btn-dark rounded-pill px-4 py-2"
                        >
                            Create Your Account
                        </Link>
                    </section>
                )}
            </main>
        </>
    );
};

export default Home;
