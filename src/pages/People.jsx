import React, { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../../context/userContext";
import axios from "axios";
import jsPDF from "jspdf";

export default function PeoplePage() {
  const { user, logout } = useContext(UserContext);
  const [comment, setComment] = useState("");
  const [document, setDocument] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("submit");
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeTab === "requests") fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await axios.get("http://localhost:8000/my-requests", {
        withCredentials: true,
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    }
    setLoadingRequests(false);
  };

  const handleFileChange = (e) => setDocument(e.target.files[0]);

  const resetForm = () => {
    setComment("");
    setDocument(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!document) return alert("Please upload a document.");
    if (!comment.trim()) return alert("Please enter a message.");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("file", document);

    try {
      const response = await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const fileUrl = response.data.fileUrl;

      await axios.post(
        "http://localhost:8000/submit-request",
        { documentUrl: fileUrl, comment },
        { withCredentials: true }
      );

      alert("Request submitted successfully!");
      resetForm();
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  const generateReceipt = (req) => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Bharat Seva Portal", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Government Service Verification Receipt", 105, 30, { align: "center" });
    doc.text(`Receipt No: GA${Math.floor(100000 + Math.random() * 900000)}`, 20, 50);
    doc.text(`Name: ${user?.name || "N/A"}`, 20, 60);
    doc.text(`Request ID: ${req._id}`, 20, 70);
    doc.text(`Status: VERIFIED`, 20, 80);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 90);
    doc.text("This receipt confirms successful document verification.", 20, 110, { maxWidth: 170 });
    doc.save(`Receipt_${req._id}.pdf`);
  };

  const getStatusColor = (status) => {
    const colors = {
      "Payment Received": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Admin1 Approved": "bg-green-100 text-green-800 border-green-200",
      "Admin2 Approved": "bg-blue-100 text-blue-800 border-blue-200",
      "Rejected": "bg-red-100 text-red-800 border-red-200",
      default: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || colors.default;
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🇮🇳</div>
              <div>
                <h1 className="text-2xl font-bold">Bharat Seva Portal</h1>
                <p className="text-sm opacity-90">Digital India - Citizen Services</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">Welcome, {user?.name || "Citizen"}</p>
                <p className="text-sm opacity-80">Verified User</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-6xl mx-auto mt-6 px-6">
        <div className="bg-white rounded-lg shadow-md p-2">
          <div className="flex">
            {[
              { key: "submit", label: "Submit Request" },
              { key: "requests", label: "Track Requests" }
            ].map((tab) => (
              <button
                key={tab.key}
                className={`flex-1 py-3 px-6 text-center font-medium rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "submit" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Submit Document Verification Request</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document (PDF Only)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {document && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {document.name} ({(document.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your verification request..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Verification Requests</h3>

            {loadingRequests ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No requests found</p>
                <button
                  onClick={() => setActiveTab("submit")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Submit Your First Request
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-800">{requests.length}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status.includes("Approved")).length}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === "Pending").length}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{requests.filter(r => r.status === "Rejected").length}</div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                  {requests.map((req, index) => (
                    <div key={req._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            Request #{index + 1} - {req._id?.slice(-8)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Document</h5>
                          <a
                            href={req.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                          >
                            View Document
                          </a>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Your Message</h5>
                          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                            {req.comment}
                          </p>
                        </div>
                      </div>

                      {req.admin1Response && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">Official Response</h5>
                          <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                            {req.admin1Response}
                          </p>
                        </div>
                      )}

                      {req.status === "Admin2 Approved" && (
                        <button
                          onClick={() => generateReceipt(req)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium transition-colors"
                        >
                          Download Receipt
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
