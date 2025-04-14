import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

function AnswerCard({ answer, questionId, loggedInUser, answerUserId, answerUsername, onVote }) {
    const navigate = useNavigate();
    const [answerUser, setAnswerUser] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:3000/api/users/${answerUserId}`)
            .then((res) => res.json())
            .then(setAnswerUser)
            .catch((err) => console.error("Failed to fetch answer user:", err));
    }, [answerUserId]);

    const handleVote = async (direction, answerId = null) => {
        const url = `http://localhost:3000/api/questions/${questionId}/answers/${answer._id}/vote`;

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
                if (onVote) await onVote();
            } else {
                toast.error(result.message || "Failed to vote");
            }
        } catch (err) {
            console.error("Voting error:", err);
            toast.error("Error submitting vote");
        }
    };
    return (
        <div className="card p-3 px-4 mb-4 shadow-sm border-gray rounded-4 position-relative">
            <div className="d-flex justify-content-between align-items-start">
                {/* Title + Content */}
                <div className="flex-grow-1 me-3">
                    <h4 className=" mb-2 mt-1">{answer.title}</h4>
                    <div className="flex-grow-1 me-3 mb-2 mt-1"
                        dangerouslySetInnerHTML={{ __html: answer.body }}
                    />
                    <div className="mb-2">
                        {answer.tags?.map((tag, i) => (
                            <span
                                key={i}
                                className="badge bg-gray text-dark fw-medium me-2 px-3 py-2 border border-gray rounded-pill"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="d-flex flex-column align-items-end text-end gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <img
                            src={
                                answerUser?.profilePic
                                    ? `http://localhost:3000${answerUser.profilePic}`
                                    : "/default-avatar.png"
                            }
                            alt="profile"
                            className="rounded-circle border-gray"
                            width={40}
                            height={40}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/users/${answerUserId}`);
                            }}
                            style={{ objectFit: "cover" }}
                        />
                        <div className="d-flex flex-column align-items-start">
                            <Link
                                to={`/users/${answerUserId}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h4>{answerUsername || "deleted account"}</h4>
                            </Link>
                            <small className="text-muted">
                                {new Date(answer.created).toLocaleString(
                                    "en-GB",
                                    {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                        hour12: true,
                                        timeZone: "Asia/Singapore",
                                    },
                                )}
                            </small>
                        </div>
                    </div>
                    {loggedInUser && loggedInUser._id === answerUserId ? (
                        <div className="mt-2">
                            <button
                                className="btn btn-md rounded-pill btn-outline-success disabled me-2"
                                disabled
                            >
                                ▲ {answer.upvotes?.length || 0}
                            </button>
                            <button
                                className="btn btn-md rounded-pill btn-outline-danger disabled"
                                disabled
                            >
                                ▼ {answer.downvotes?.length || 0}
                            </button>
                        </div>
                    ) : (
                        <div className="mb-2 d-flex gap-2">
                            <button
                                className="btn btn-md rounded-pill btn-outline-success"
                                onClick={() => handleVote("up", answer._id)}
                            >
                                ▲ {answer.upvotes?.length || 0}
                            </button>
                            <button
                                className="btn btn-md rounded-pill btn-outline-danger"
                                onClick={() => handleVote("down", answer._id)}
                            >
                                ▼ {answer.downvotes?.length || 0}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnswerCard;
