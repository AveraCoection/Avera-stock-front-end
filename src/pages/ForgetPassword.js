import React, { useState } from "react";
import GlobalApiState from "../utilis/globalVariable";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (response.status === 200) {
                toast.success("Check your Email for reset link");
                navigate('/login');
            } else {
                toast.error("Failed to send reset link");
            }
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
              <ToastContainer />
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 shadow-md rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Forgot Password</h2>
                <p className="text-gray-600 text-center mb-6">Enter your email to receive a reset link.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white py-3 rounded-lg transition ${
                            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <a href="/login" className="text-blue-500 hover:underline text-sm">
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
        </>
    );
};

export default ForgetPassword;
