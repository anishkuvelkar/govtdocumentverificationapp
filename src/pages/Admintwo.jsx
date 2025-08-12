import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/userContext";

export default function AdminTwo() {
  const { user, logout } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://govtdocumentverificationapp.onrender.com/admin2/requests", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch admin2 requests:", err);
    }
    setLoading(false);
  };

  const onLogoutClick = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch(`https://govtdocumentverificationapp.onrender.com/admin2/request/${id}/approve`, {
        method: "POST",
        credentials: "include",
      });
      fetchRequests();
    } catch (err) {
      console.error("Approve failed:", err);
    }
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleReject = async (id) => {
    if (!rejectionMessage[id] || rejectionMessage[id].trim() === "") {
      alert("Please enter a rejection message");
      return;
    }
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch(`https://govtdocumentverificationapp.onrender.com/admin2/request/${id}/reject`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: rejectionMessage[id] }),
      });
      fetchRequests();
      setRejectionMessage((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Reject failed:", err);
    }
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Government Header */}
      <header className="bg-white border-b-4 border-orange-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Government Branding */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 67'%3E%3Crect width='100' height='22.33' fill='%23FF9933'/%3E%3Crect y='22.33' width='100' height='22.33' fill='%23FFFFFF'/%3E%3Crect y='44.67' width='100' height='22.33' fill='%23138808'/%3E%3Ccircle cx='50' cy='33.5' r='8' fill='%23000080'/%3E%3C/svg%3E"
                  alt="Indian Flag"
                  className="w-12 h-8 border border-gray-300"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Government of India
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Digital Document Verification Portal
                  </p>
                </div>
              </div>
              <div className="h-12 w-px bg-gray-300"></div>
              <div>
                <h2 className="text-lg font-semibold text-blue-800">
                  Level 2 Verification Dashboard
                </h2>
                <p className="text-sm text-gray-600">
                  Administrative Review & Approval System
                </p>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right pr-4 border-r border-gray-300">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name || "Admin Officer"}
                </p>
                <p className="text-xs text-gray-600">
                  Level 2 Verification Officer
                </p>
                <p className="text-xs text-blue-600">
                  ID: {user?._id?.slice(-6) || "N/A"}
                </p>
              </div>
              
              <button
                onClick={onLogoutClick}
                disabled={loggingOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border border-red-700 shadow-sm"
              >
                {loggingOut ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Document Verification Queue
              </h2>
              <p className="text-gray-600">
                Review and process Level 2 verification requests
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
              <div className="text-sm text-gray-500">Pending Requests</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading verification requests...</p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-600">All verification requests have been processed.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req, index) => (
              <div
                key={req._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Request Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request #{index + 1}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        ID: {req._id?.slice(-12) || 'N/A'} | 
                        Submitted: {new Date(req.createdAt || Date.now()).toLocaleDateString("en-IN", {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="bg-yellow-100 border border-yellow-300 px-3 py-1 rounded-md">
                      <span className="text-yellow-800 text-sm font-medium">Pending Review</span>
                    </div>
                  </div>
                </div>

                {/* Request Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Document Section */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Document Attachment
                        </label>
                        <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                          <a
                            href={req.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>View PDF Document</span>
                          </a>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          User Message
                        </label>
                        <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[100px]">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                            {req.comment || "No message provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Message Section */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rejection Reason <span className="text-red-600">(Required for rejection)</span>
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Enter detailed reason for rejection. Include specific issues found with the document or application."
                        value={rejectionMessage[req._id] || ""}
                        onChange={(e) =>
                          setRejectionMessage((prev) => ({
                            ...prev,
                            [req._id]: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        disabled={actionLoading[req._id]}
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        {(rejectionMessage[req._id] || "").length}/500 characters
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(req._id)}
                      disabled={actionLoading[req._id]}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 border border-green-700 shadow-sm"
                    >
                      {actionLoading[req._id] ? (
                        <>
                          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Approve Request</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleReject(req._id)}
                      disabled={actionLoading[req._id]}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 border border-red-700 shadow-sm"
                    >
                      {actionLoading[req._id] ? (
                        <>
                          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Reject Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-12 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Digital India Initiative</span>
              <span>|</span>
              <span>Ministry of Electronics & Information Technology</span>
            </div>
            <div>
              <span>Government of India © 2025</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
