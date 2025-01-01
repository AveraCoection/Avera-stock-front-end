// import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import GlobalApiState from "../utilis/globalVariable";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);


  const authContext = useContext(AuthContext);
  const navigate = useNavigate();


  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const authCheck = async () => {
  //   setTimeout(async () => {
  //     try {
  //       const response = await fetch("https://avera-stock-back-end.vercel.app/api/login");
  //       const data = await response.json();
  //       localStorage.setItem("user", JSON.stringify(data));
  //       toast.success("Successfully Login");
  //       authContext.signin(data._id, () => {
  //         setTimeout(() => {
  //           navigate("/");
  //         }, 1000);
  //       });

  //     } catch (err) {
  //       toast.error(err);
  //       console.log(err);
  //     }
  //   }, 3000);
  // };


  const loginUser = async (e) => {
    e.preventDefault();  // Prevent form submission default behavior
    setIsLoading(true)
    // Cannot send empty data
    if (form.email === "" || form.password === "") {
      toast.warning("Please enter both email and password to proceed.");
      return;
    }

    try {
      const response = await fetch(`${GlobalApiState.DEV_BASE_LIVE}/api/login`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      // Parse the response data
      const data = await response.json();

      // Store user data in local storage
      localStorage.setItem("user", JSON.stringify(data));

      // Show success toast
      toast.success("Successfully Logged in!");

      // Sign the user in and navigate after 1 second delay
      authContext.signin(data._id, () => {
        setTimeout(() => {
          navigate("/");
        }, 1000);
      });

    } catch (err) {
      toast.error(err.message || "Something went wrong during login.");
      console.error(err);
    }
  };



  const handleSubmit = (e) => {
    e.preventDefault();
  };


  return (
    <>
      <ToastContainer />
      <div className="grid grid-cols-1 sm:grid-cols-2 h-screen  items-center place-items-center">
        <div className="flex justify-center">
          <img src={require("../assets/signup.jpg")} alt="" />
        </div>
        <div className="w-full max-w-md space-y-8 p-10 rounded-lg">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src={require("../assets/logo.png")}
              alt="Your Company"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Signin to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or
              <span
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                start your 14-day free trial
              </span>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* <input type="hidden" name="remember" defaultValue="true" /> */}
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-t-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-b-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <span
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`group relative flex w-full justify-center rounded-md py-2 px-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isLoading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
                  }`}
                onClick={loginUser}
                disabled={isLoading}
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  {isLoading ? (
                    <svg
                      className="h-5 w-5 animate-spin text-indigo-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                  ) : (
                    // Optional: Add an icon or leave blank
                    <span></span>
                  )}
                </span>
                {isLoading ? 'Loading...' : 'Sign in'}
              </button>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{" "}
                <span
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Don't Have an Account, Please{" "}
                  <Link to="/register"> Register now </Link>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
