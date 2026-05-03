// import { createContext } from "react";

// let AuthContext = createContext(null);

// export default AuthContext;

import { createContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on first render
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    // Sync user state with localStorage
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const signin = (newUser, callback) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser)); // Save user to localStorage
    if (callback) callback();
  };

  const signout = (callback) => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    if (callback) callback();
  };

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
