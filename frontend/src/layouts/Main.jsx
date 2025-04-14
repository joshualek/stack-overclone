import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/style.css";

const Main = ({ user }) => {
    return (
        <>
            <Navbar user={user} />
            <main className="layout">
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default Main;

// This file is a layout component.
// It defines the common layout structure (e.g., header, footer, sidebar) that is shared across multiple pages.
// It uses the Outlet component from react-router-dom to render child routes.
