import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {toast} from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';
import Home from './Home';

export default function Signup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [serverError, setServerError] = useState('');

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirmPwd) {
    toast.error("Passwords do not match!");
    return;
  }

  try {
    const response = await axios.post('https://govtdocumentverificationapp.onrender.com/register', {
      name: fullName,
      email,
      password,
    },
    {
    withCredentials: true, // <-- add this option
    });

    toast.success('Account created successfully!');
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPwd('');
    setServerError('');
    navigate('/')
  } catch (error) {
    // Extract backend error data
    const data = error.response?.data;
    const errorType = data?.errorType;
    const message = data?.message || 'Something went wrong. Please try again later.';

    // Handle specific error types for nicer toasts (optional)
    switch (errorType) {
      case 'NAME_REQUIRED':
        toast.error('Please enter your name.');
        break;
      case 'EMAIL_REQUIRED':
        toast.error('Email is required.');
        break;
      case 'EMAIL_INVALID':
        toast.error('Invalid email format.');
        break;
      case 'PASSWORD_REQUIRED':
        toast.error('Password is required.');
        break;
      case 'PASSWORD_TOO_SHORT':
        toast.error('Password must be at least 6 characters.');
        break;
      case 'EMAIL_EXISTS':
        toast.error('This email is already registered.');
        break;
      case 'SERVER_ERROR':
      default:
        toast.error(message);
        break;
    }

    setServerError(message);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0d1b10] to-[#071008] text-white px-6 py-10 relative overflow-hidden font-sans">

      {/* Glow blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#FF9933] opacity-20 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#1A237E] opacity-20 rounded-full blur-2xl animate-pulse z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#138808] opacity-20 rounded-full blur-2xl animate-ping z-0" />

      {/* Header */}
      <header className="z-10 relative mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-[#FF9933] drop-shadow-lg">
          Create Your Account
        </h1>
        <p className="text-gray-300 mt-3 max-w-md mx-auto">
          Join the official Goa Govt. verification system. Sign up and manage your digital documents with ease.
        </p>
      </header>

      {/* Signup Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 relative max-w-lg mx-auto bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-[#1A237E] shadow-2xl"
      >
        <h2 className="text-2xl font-semibold text-[#1A237E] text-center mb-6">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-[#FF9933] text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-[#FF9933] text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-[#FF9933] text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="confirmPwd">Confirm Password</label>
            <input
              id="confirmPwd"
              type="password"
              placeholder="••••••••"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-[#FF9933] text-white outline-none"
            />
          </div>

          {serverError && (
            <p className="text-red-500 text-sm text-center">{serverError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#138808] hover:bg-green-700 py-2 rounded-md text-white font-semibold transition"
          >
            Create Account
          </button>

          <p className="text-sm text-gray-300 text-center mt-3">
            Already have an account?{' '}
            <Link to="/" className="text-[#FF9933] hover:underline font-medium">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
