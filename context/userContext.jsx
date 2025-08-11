import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from 'react';
export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      axios.get("/profile", { withCredentials: true })
        .then(({ data }) => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  const logout = async () => {
    try {
      await axios.post("/logout", {}, { withCredentials: true });
      setUser(null);
      navigate("/", { replace: true }); // ⬅ Redirect to Home
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}
