import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

function Login({ setUser }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const query = new URLSearchParams(useLocation().search);
    const forgotPassword = query.get("forgotPassword") === "true";
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = forgotPassword
            ? "http://localhost:3000/api/doforgotpassword"
            : "http://localhost:3000/api/login";

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password }),
        });

        const json = await res.json();

        if (res.ok) {
            if (forgotPassword) {
                toast.success("Reset password successful");
                navigate("/login");
            } else {
                const decoded = jwtDecode(json.accessToken);
                setUser({ _id: decoded.userId });
                localStorage.setItem("accesstoken", json.accessToken);
                toast.success("Login successful!");
                navigate("/");
            }
        } else {
            setError(json.message || "Something went wrong");
            toast.error(json.message || "Login failed");
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
                        <Link className="navbar-brand pb-4" to="/">
                            <img src="/stack-overclone.svg" className="logo" />
                        </Link>
                    </div>
                    <h2 className="text-center mt-3">
                        {forgotPassword ? "Forgot Password" : "Login"}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group mt-3">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                            />
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={
                                    forgotPassword
                                        ? "Set New Password"
                                        : "Password"
                                }
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-block rounded-pill mt-3 w-100"
                        >
                            {forgotPassword ? "Set New Password" : "Login"}
                        </button>
                        <div className="text-center mt-3">
                            <Link to="/register">
                                <span>Don't have an account? Register</span>
                            </Link>
                        </div>
                        <div className="text-center mt-3">
                            {forgotPassword ? (
                                <Link to="/login">
                                    <span>Back to Login</span>
                                </Link>
                            ) : (
                                <Link to="/login?forgotPassword=true">
                                    <span>Forgot Password</span>
                                </Link>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
