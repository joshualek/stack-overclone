import React, { useState } from "react";

function EditForm({ user, setEditMode }) {
    const [form, setForm] = useState({
        username: user.username,
        email: user.email,
        password: "",
        bio: user.bio || "",
        profilePic: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        for (let key in form) {
            if (form[key]) data.append(key, form[key]);
        }

        const res = await fetch(
            `http://localhost:3000/api/users/${user._id}/edit`,
            {
                method: "PATCH",
                body: data,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
                },
            },
        );

        const result = await res.json();
        if (result.success) {
            window.location.reload(); // or refetch user
        } else {
            alert(result.error || "Failed to update");
        }
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                    type="text"
                    name="username"
                    className="form-control"
                    value={form.username}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                    type="password"
                    name="password"
                    className="form-control"
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Bio</label>
                <textarea
                    name="bio"
                    className="form-control"
                    value={form.bio}
                    rows={3}
                    onChange={handleChange}
                ></textarea>
            </div>
            <div className="mb-3">
                <label className="form-label">Profile Picture</label>
                <input
                    type="file"
                    name="profilePic"
                    className="form-control"
                    accept="image/*"
                    onChange={handleChange}
                />
            </div>
            <button type="submit" className="btn btn-success rounded-pill">
                Save
            </button>
            <button
                type="button"
                className="btn btn-secondary rounded-pill ms-2"
                onClick={() => setEditMode(false)}
            >
                Cancel
            </button>
        </form>
    );
}

export default EditForm;
