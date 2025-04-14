import React from "react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <>
            <div
                className="footer-bottom  text-center"
                style={{
                    height: "5px",
                    backgroundColor: "var(--heading-color)",
                }}
            ></div>
            <div className="container-lg">
                <p className="m-0">
                    © 2025 Stack Overclone by
                    <Link
                        to="https://www.linkedin.com/in/joshualek"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none" }}
                    >
                        <span style={{ color: "var(--bs-primary)" }}>
                            {" "}
                            Joshua Lek.
                        </span>
                    </Link>
                </p>
            </div>
        </>
    );
}

export default Footer;
