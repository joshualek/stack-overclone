import { Link, useNavigate } from "react-router-dom";

function QuestionCard({ question, userMap }) {
    const navigate = useNavigate();
    const user = userMap?.[question.userId];

    return (
        <div
            className="card p-3 px-4 mb-4 shadow-sm border-gray rounded-4 position-relative"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/questions/${question._id}`)}
        >
            <div className="d-flex justify-content-between align-items-start">
                {/* Title + Content */}
                <div className="flex-grow-1 me-3">
                    <h4 className=" mb-2 mt-1">{question.title}</h4>
                    <div className="flex-grow-1 me-3 mb-2 mt-1"
                        dangerouslySetInnerHTML={{ __html: question.problem }}
                    />
                    <div className="mb-2">
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
                </div>

                {/* Right Sidebar */}
                <div className="d-flex flex-column align-items-end text-end gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <img
                            src={
                                user?.profilePic
                                    ? `http://localhost:3000${user.profilePic}`
                                    : "/default-avatar.png"
                            }
                            alt="profile"
                            className="rounded-circle border-gray"
                            width={40}
                            height={40}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/users/${question.userId}`);
                            }}
                            style={{ objectFit: "cover" }}
                        />
                        <div className="d-flex flex-column align-items-start">
                            <Link
                                to={`/users/${question.userId}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h4>{user?.username || "deleted account"}</h4>
                            </Link>
                            <small className="text-muted">
                                {new Date(question.created).toLocaleString(
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
                    <div className="mt-2">
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
                </div>
            </div>
        </div>
    );
}

export default QuestionCard;
