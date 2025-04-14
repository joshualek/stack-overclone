import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function FormInput(props) {
    const {
        user,
        mode = "answer",
        initialData = {},
        question,
        answer,
        onCancel,
    } = props;

    const [formData, setFormData] = useState({
        title: initialData.title || "",
        body: initialData.body || "",
        tags: (initialData.tags || []).join(", "),
    });

    const navigate = useNavigate();

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            title: formData.title,
            body: formData.body,
            tags: formData.tags.split(",").map((tag) => tag.trim()),
            created: new Date(),
            username: user?.username,
        };

        try {
            let res;
            if (mode === "add") {
                res = await fetch("http://localhost:3000/api/questions/ask", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                    body: JSON.stringify(payload),
                });
            } else if (mode === "edit" && question?._id) {
                res = await fetch(`http://localhost:3000/api/questions/${question._id}/edit`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                    },
                    body: JSON.stringify(payload),
                });
            } else if (mode === "answer" && question?._id) {
                res = await fetch(
                    `http://localhost:3000/api/questions/${question._id}/answers/add`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                        },
                        body: JSON.stringify({
                            body: formData.body,
                            title: formData.title,
                            tags: payload.tags,
                            created: payload.created,
                            username: payload.username,
                        }),
                    }
                );
            } else if (mode === "editAnswer" && question?._id && answer?._id) {
                res = await fetch(
                    `http://localhost:3000/api/questions/${question._id}/answers/${answer._id}/edit`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                        },
                        body: JSON.stringify({
                            body: formData.body,
                            title: formData.title,
                            tags: payload.tags,
                            created: payload.created,
                            username: payload.username,
                        }),
                    }
                );
            }

            const result = await res.json();

            if (res.ok) {

                toast.success(
                    mode === "edit"
                        ? "Question updated successfully"
                        : mode === "editAnswer"
                            ? "Answer updated successfully"
                            : mode === "add"
                                ? "Question posted!"
                                : "Answer submitted!"
                );

                if (mode === "add" || mode === "edit") {
                    setTimeout(() => navigate("/questions"), 1000);
                } else {
                    setTimeout(() => window.location.reload(), 1000);
                }
            } else {
                alert(result.message || "Something went wrong");
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Something went wrong.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-3">
                <label className="fw-bold form-label">Title</label>
                <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange("title")}
                    placeholder="Enter your title as a short phrase to summarise the content"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="fw-bold form-label">Tags (comma-separated)</label>
                <input
                    type="text"
                    className="form-control"
                    value={formData.tags}
                    onChange={handleChange("tags")}
                    placeholder="eg. javascript, error, coding"
                />
            </div>

            <div className="mb-3">
                <label className="fw-bold form-label">{mode === "answer" ? "Your Answer" : "Details"}</label>
                <Editor
                    apiKey="ajhvp2fmkq0ovuy6qp7zwyde7hryhrnfcavv4vrws9b93ryg"
                    value={formData.body}
                    onEditorChange={(content) =>
                        setFormData((prev) => ({ ...prev, body: content }))
                    }
                    init={{
                        height: 400,
                        statusbar: false,
                        plugins: "image code lists",
                        toolbar:
                            "undo redo | bold italic underline | bullist numlist | image",
                        images_upload_url: "http://localhost:3000/api/questions/image",
                        automatic_uploads: true,
                        images_upload_handler: function (blobInfo, success, failure) {
                            const formData = new FormData();
                            formData.append("file", blobInfo.blob(), blobInfo.filename());

                            fetch("http://localhost:3000/api/questions/image", {
                                method: "POST",
                                body: formData,
                            })
                                .then((res) => res.json())
                                .then((json) => success(json.location))
                                .catch(() => failure("Image upload failed"));
                        },
                    }}
                />
            </div>

            <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary rounded-pill">
                    {mode === "edit" ? "Update Question"
                        : mode === "add" ? "Post Question"
                            : mode === "answer" ? "Post Your Answer" : "Update Answer"}
                </button>

                {(mode === "edit" || mode === "editAnswer") && onCancel && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
            </div>

        </form>
    );
}

export default FormInput;