import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EditForm from "../../components/EditForm";
import QuestionCard from "../../components/QuestionCard";

function ProfilePage({ loggedInUser }) {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3000/api/users/${id}`)
      .then((res) => res.json())
      .then(setUser)
      .catch((err) => console.error("Failed to fetch user:", err));
  }, [id]);

  useEffect(() => {
    fetch("http://localhost:3000/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const userMap = {};
  users.forEach((u) => {
    userMap[u._id?.toString()] = u;
  });

  if (!user) return <div>Loading...</div>;

  const isOwner = loggedInUser && loggedInUser._id?.toString() === user._id?.toString();

  return (
    <main className="container-lg mt-5">
      <h1 className="mb-4">User Profile</h1>
      <div className="card mb-4 p-3">
        <div className="row align-items-center">
          {/* Profile Picture */}
          <div className="col-md-3 text-center">
            {user.profilePic ? (
              <img
                src={`http://localhost:3000${user.profilePic}`}
                className="img-fluid rounded-circle"
                style={{ width: "200px", height: "200px", minWidth: "50px", minHeight: "50px", objectFit: "cover" }}
                alt="Profile"
              />
            ) : (
              <div
                className="bg-light rounded-circle"
                style={{ width: "200px", height: "200px" }}
              ></div>
            )}
          </div>

          {/* Profile Info */}
          <div className="col-md-9">
            {!editMode ? (
              <>
                <p className="profile-view">
                  <strong>Username:</strong> {user.username}
                </p>
                <p className="profile-view">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="profile-view">
                  <strong>Bio:</strong> {user.bio || "No bio provided"}
                </p>
                <p className="profile-view">
                  <strong>Joined:</strong>{" "}
                  {new Date(user.created).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                    timeZone: "Asia/Singapore",
                  })}
                </p>
                {isOwner && (
                  <button
                    className="btn btn-primary rounded-pill"
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </>
            ) : (
              <EditForm user={user} setEditMode={setEditMode} />
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Questions Asked */}
      <div className="row mt-5">
        <div className="col-md-6">
          <h2>Questions You Asked</h2>
          {user.questions?.length > 0 ? (
            user.questions.map((q) => (
              <QuestionCard
                key={q._id}
                question={q}
                userMap={userMap}
              />
            ))
          ) : (
            <p className="text-muted">No questions posted yet.</p>
          )}
        </div>

        {/* Questions Answered */}
        <div className="col-md-6">
          <h2>Questions You Answered</h2>
          {user.answers?.length > 0 ? (
            user.answers.map(({ question }) =>
              question ? (
                <QuestionCard
                  key={question._id}
                  question={question}
                  userMap={userMap}
                />
              ) : null
            )
          ) : (
            <p className="text-muted">No answers posted yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;