import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import GlobalApiState from "../utilis/globalVariable";

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (response.status === 200) {
                toast.success("Password reset successful! You can now log in.");
                navigate("/login");
            } else {
                toast.error("Invalid or expired token");
            }
        } catch (error) {
            toast.error(`Error: ${error.message}`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
          <ToastContainer />
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 shadow-md rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Reset Password</h2>
                <p className="text-gray-600 text-center mb-6">Enter a new password for your account.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
