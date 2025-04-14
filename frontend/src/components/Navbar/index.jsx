import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/style.css";

function Navbar({ user }) {
    const navigate = useNavigate();
    useEffect(() => {});

    const handleLogout = () => {
        localStorage.removeItem("accesstoken");
        window.location.href = "/"; // hard refresh to reset all state
    };

    return (
        <>
            <div
                style={{
                    height: "10px",
                    backgroundColor: "var(--heading-color)",
                }}
            ></div>
            <nav
                id="header-nav"
                className="navbar navbar-expand-lg py-3 border-bottom mb-2"
            >
                <div className="container-lg">
                    <Link className="navbar-brand pb-4" to="/">
                        <img
                            src="/stack-overclone.svg"
                            className="logo"
                            alt="Stack Overclone Logo"
                        />
                    </Link>
                    {/* Menu button */}
                    <button
                        className="navbar-toggler d-flex d-lg-none order-3 p-2 border-0 shadow-none bg-white"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#bdNavbar"
                        aria-controls="bdNavbar"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <svg className="navbar-icon" width="50" height="50">
                            <use xlinkHref="#navbar-icon"></use>
                        </svg>
                    </button>
                    {/* Navbar */}
                    <div
                        className="offcanvas offcanvas-end"
                        tabIndex="-1"
                        id="bdNavbar"
                        aria-labelledby="bdNavbarOffcanvasLabel"
                    >
                        <div className="offcanvas-header px-4 pb-0">
                            <button
                                type="button"
                                className="btn-close btn-close-black"
                                data-bs-dismiss="offcanvas"
                                aria-label="Close"
                                data-bs-target="#bdNavbar"
                            ></button>
                        </div>
                        <div className="offcanvas-body">
                            <ul className="navbar-nav scrollspy-nav justify-content-end flex-grow-1 gap-lg-5 pe-3">
                                <li className="scrollspy-link nav-item">
                                    <Link className="nav-link text-dark" to="/">
                                        Home
                                    </Link>
                                </li>
                                {/* Questions nav */}
                                <li className="scrollspy-link nav-item">
                                    <Link
                                        className="nav-link text-dark"
                                        to="/questions"
                                    >
                                        Questions
                                    </Link>
                                </li>
                                {user && user._id ? (
                                    <>
                                        <li className="scrollspy-link nav-item">
                                            <Link
                                                className="nav-link text-dark"
                                                to={`/users/${user._id}`}
                                            >
                                                Profile
                                            </Link>
                                        </li>
                                        <li className="scrollspy-link nav-item">
                                            <button
                                                className="btn btn-primary rounded-pill"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    <li className="scrollspy-link nav-item">
                                        <button
                                            className="btn btn-primary rounded-pill"
                                            onClick={() => navigate("/login")}
                                        >
                                            Login
                                        </button>
                                    </li>
                                )}
                                <span className="scrollspy-indicator"></span>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
