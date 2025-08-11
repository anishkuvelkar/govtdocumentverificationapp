import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";

export default function MainPage() {
  const { user } = useContext(UserContext);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-orange-900 mb-2">
        Hello Mr. {user?.name || "User"} 👋
      </h2>
      <p className="text-gray-700 mb-4">Welcome to your dashboard. Here are the services we offer:</p>
      <ul className="list-disc list-inside text-gray-800 space-y-1">
        <li>Submit requests for document-based tasks</li>
        <li>Securely upload files for processing</li>
        <li>Make quick payments via Zelle</li>
        <li>Track the status of all your requests</li>
        <li>Download finalized documents</li>
      </ul>
    </div>
  );
}
