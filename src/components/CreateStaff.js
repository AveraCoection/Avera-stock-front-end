import React, { useContext, useState } from "react";
import GlobalApiState from "../utilis/globalVariable";
import { toast } from "react-toastify";
import AuthContext from "../AuthContext";
import { useNavigate } from "react-router-dom";

function CreateStaff() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    userId: user.user._id,
    email: "",
    password: "",
  });

  const token = localStorage.getItem('token')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Optional: Show loading state

    try {
      const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/auth/create-staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json(); // Parse response JSON

      if (!response.ok) {
        throw new Error(data.errors || data.message || "Something went wrong.");
      }

      toast.success(data.message);
      navigate('/staff');

    } catch (err) {
      toast.error(err.message || "Something went wrong.");
      console.error("API Error:", err);
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };


  return (
    <div className="flex items-center justify-center lg:w-[80vw] md:w-[100vw] w-[100vw] relative ">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Create Staff</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-600">First Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div> */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-600">Last Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div> */}
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Role Selection */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-600">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div> */}

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md transition duration-200"
          >
            Create Staff
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateStaff;
