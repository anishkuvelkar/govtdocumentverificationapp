import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import React from 'react';
export default function ProtectedRoute({ children }) {
  const { user } = useContext(UserContext);

  // If no user in context, redirect to home/login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}