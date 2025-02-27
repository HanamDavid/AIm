import Form from "../components/Form"
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";

function Register() {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            navigate("/");  // Redirect to home page if user is already logged in
        }
    }, [navigate]);
    return (
        <>
            <div className="Divider">
                {/* Left Side: Login Form */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}>
                    <Form route="/api/user/register/" method="register"/>
                </motion.div>

                {/* Right Side: Animated Welcome */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}>
                    <img className="logo" src="/Aimhub.svg" width="400" alt="Logo" />
                    <h1 className="welcome-message">Join Us</h1>
                </motion.div>
            </div>

            <footer className="home-footer">
                <p>© 2025 Aim - Your Favorite place for economic insights</p>
            </footer>
        </>
    );
}



export default Register
