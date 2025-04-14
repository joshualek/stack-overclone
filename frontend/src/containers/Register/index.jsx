import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const json = await res.json();

            if (res.ok) {
                toast.success("Registered successfully");
                navigate("/login");
            } else {
                setError(json.message || "Something went wrong");
                toast.error(json.message || "Registration failed");
            }
        } catch (err) {
            setError(err.message || "Something went wrong");
            toast.error(err.message || "Registration failed");
        }
    };

    return (
        <div className="container">
            <div
                className="row justify-content-center align-items-center"
                style={{ height: "90vh" }}
            >
                <div className="col-md-6">
                    <div className="text-center">
                        <a className="navbar-brand pb-4" href="/">
                            <img
                                src="/stack-overclone.svg"
                                className="logo"
                                alt="logo"
                            />
                        </a>
                    </div>
                    <h2 className="text-center mt-3">Register</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                            />
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-block rounded-pill mt-3 w-100"
                        >
                            Register
                        </button>
                        {error && (
                            <p className="text-danger mt-2 text-center">
                                {error}
                            </p>
                        )}
                        <div className="text-center mt-3">
                            <a href="/login">
                                <span>Already have an account? Login</span>
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
