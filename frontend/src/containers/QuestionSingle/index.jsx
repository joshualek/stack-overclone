import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AnswerCard from "../../components/AnswerCard";
import FormInput from "../../components/FormInput";
import { toast } from "react-toastify";

function QuestionSingle({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editAnswerId, setEditAnswerId] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:3000/api/questions/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setQuestion(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch question:", err);
                setLoading(false);
            });
    }, [id]);

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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!question) {
        return <div>Question not found.</div>;
    }

    const handleVote = async (direction, answerId = null) => {
        const url = `http://localhost:3000/api/questions/${question._id}/vote`

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                },
                body: JSON.stringify({ voteType: direction }),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success("Vote recorded");
                // reload updated data
                const updated = await fetch(`http://localhost:3000/api/questions/${question._id}`);
                const data = await updated.json();
                setQuestion(data);
            } else {
                toast.error(result.message || "Failed to vote");
            }
        } catch (err) {
            console.error("Voting error:", err);
            toast.error("Error submitting vote");
        }
    };

    const handleDeleteQuestion = async () => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/questions/${id}/delete`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                },
            });

            const result = await res.json();
            if (res.ok) {
                toast.success("Question deleted successfully");
                setTimeout(() => navigate("/questions"), 1000);
            } else {
                toast.error(result.message || "Failed to delete question");
            }
        } catch (err) {
            console.error("Delete question error:", err);
            toast.error("Error deleting question");
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        if (!window.confirm("Are you sure you want to delete this answer?")) return;

        try {
            const res = await fetch(
                `http://localhost:3000/api/questions/${id}/answers/${answerId}/delete`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                }
            );

            const result = await res.json();
            if (res.ok) {
                toast.success("Answer deleted successfully");
                // refetch question to update UI
                setEditAnswerId(null);
                setLoading(true);
                const updated = await fetch(`http://localhost:3000/api/questions/${id}`);
                const data = await updated.json();
                setQuestion(data);
                setLoading(false);
            } else {
                toast.error(result.message || "Failed to delete answer");
            }
        } catch (err) {
            console.error("Delete answer error:", err);
            toast.error("Error deleting answer");
        }
    };


    return (
        <main className="container-lg">
            <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-4">{question.title}</h2>
                {user ? (
                    <Link to="/questions/ask" className="btn btn-primary btn-md rounded-pill">
                        Ask Question
                    </Link>
                ) : (
                    <Link to="/login" className="btn btn-primary btn-md rounded-pill">
                        Login to Ask Question
                    </Link>
                )}
            </div>

            <div className="d-flex flex-wrap align-items-center text-muted small gap-3 mb-4">
                <h4>Created</h4>{" "}
                {new Date(question.created).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                    timeZone: "Asia/Singapore",
                })}
                <h4>Asked by</h4>
                <Link
                    to={`/users/${question.userId}`}
                    className="text-decoration-none text-dark"
                    onClick={(e) => e.stopPropagation()}
                >
                    {userMap[question.userId]?.username || "deleted account"}
                </Link>
                <img
                    src={
                        userMap[question.userId]?.profilePic
                            ? `http://localhost:3000${userMap[question.userId].profilePic}`
                            : "/default-avatar.png"
                    }
                    alt="profile"
                    className="rounded-circle border-gray"
                    width={30}
                    height={30}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/users/${question.userId}`);
                    }}
                    style={{ objectFit: "cover" }}
                />
            </div>

            <div className="mb-4">
                {user && user._id !== question.userId ? (
                    <div className="mb-3 d-flex gap-2 align-items-center">
                        <button
                            className="btn btn-md rounded-pill btn-outline-success"
                            onClick={() => handleVote("up")}
                        >
                            ▲ {question.upvotes?.length || 0}
                        </button>
                        <button
                            className="btn btn-md rounded-pill btn-outline-danger"
                            onClick={() => handleVote("down")}
                        >
                            ▼ {question.downvotes?.length || 0}
                        </button>
                    </div>
                ) : (
                    <div className="mb-3 d-flex gap-2 align-items-center">
                        <button
                            className="btn btn-md rounded-pill btn-outline-success disabled me-2"
                            disabled
                        >
                            ▲ {question.upvotes?.length || 0}
                        </button>
                        <button
                            className="btn btn-md rounded-pill btn-outline-danger disabled"
                            disabled
                        >
                            ▼ {question.downvotes?.length || 0}
                        </button>
                    </div>
                )}

                {user && user._id === question.userId && (
                    <>
                        <button
                            className="btn btn-md rounded-pill btn-primary"
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? "Cancel Edit" : "Edit"}
                        </button>
                        <button
                            className="btn btn-md rounded-pill btn-outline-danger ms-2"
                            onClick={handleDeleteQuestion}
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>

            {editMode ? (
                <FormInput
                    user={user}
                    mode="edit"
                    question={question}
                    initialData={{
                        title: question.title,
                        body: question.problem,
                        tags: question.tags,
                    }}
                    onCancel={() => setEditMode(false)}
                />

            ) : (
                <>
                    <div
                        className="d-flex flex-wrap gap-3 mb-4"
                        dangerouslySetInnerHTML={{ __html: question.problem }}
                    />
                    <div className="mb-4">
                        {question.tags?.map((tag, i) => (
                            <span
                                key={i}
                                className="badge bg-gray text-dark fw-medium me-2 px-3 py-2 border border-gray rounded-pill"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/questions?tag=${tag}`);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </>
            )}

            <hr />
            <h2>Answers</h2>
            <div className="row">
                <div className="col-md-12">
                    {loading ? (
                        <p className="text-muted">Loading...</p>
                    ) : question.answers?.length > 0 ? (
                        question.answers.map((a) => (
                            <div key={a._id} className="mb-4">
                                <AnswerCard
                                    answer={a}
                                    loggedInUser={user}
                                    answerUserId={a.userId}
                                    answerUsername={a.username}
                                    questionId={question._id}
                                    onVote={async () => {
                                        const updated = await fetch(`http://localhost:3000/api/questions/${question._id}`);
                                        const data = await updated.json();
                                        setQuestion(data);
                                    }}
                                />
                                {user && user._id === a.userId && (
                                    <>
                                        <button
                                            className="btn btn-primary btn-md rounded-pill"
                                            onClick={() => setEditAnswerId(a._id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-md rounded-pill btn-outline-danger ms-2"
                                            onClick={() => handleDeleteAnswer(a._id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                                {editAnswerId === a._id && (
                                    <FormInput
                                        user={user}
                                        mode="editAnswer"
                                        question={question}
                                        answer={a}
                                        initialData={{
                                            title: a.title,
                                            body: a.body,
                                            tags: a.tags || [],
                                        }}
                                        onCancel={() => setEditAnswerId(null)}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">No answers yet. Be the first to answer!</p>
                    )}
                </div>
                <div className="col-md-12 mb-3">
                    <h3 className="mt-5">Your Answer</h3>
                    <FormInput user={user} question={question} mode="answer" />
                </div>
            </div>
        </main>
    );
}

export default QuestionSingle;
