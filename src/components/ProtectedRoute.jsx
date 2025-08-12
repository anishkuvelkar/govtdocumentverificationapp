import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import React from 'react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Loading session...</div>; // or a spinner
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
