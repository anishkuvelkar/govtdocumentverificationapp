import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserContext } from '../../context/userContext'; // ✅ Import context

export default function Home() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // ✅ Get setUser from context

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email.');
      return;
    }
    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:8000/login',
        { email: email.trim(), password },
        { withCredentials: true }
      );

      toast.success('Login successful!');
      console.log('Login successful:', res.data);

      const user = res.data.user;

      setUser(user); // ✅ Store user in context

      // Navigate based on role
      if (user.role === 'admin1') {
        navigate('/admin1');
      } else if (user.role === 'admin2') {
        navigate('/admintwo');
      } else {
        navigate('/customers');
      }
    } catch (err) {
      const data = err.response?.data;
      const message = data?.message || 'Something went wrong. Please try again.';

      switch (data?.errorType) {
        case 'EMAIL_REQUIRED':
          toast.error('Email is required.');
          break;
        case 'PASSWORD_REQUIRED':
          toast.error('Password is required.');
          break;
        case 'INVALID_CREDENTIALS':
          toast.error('Invalid email or password.');
          break;
        case 'SERVER_ERROR':
        default:
          toast.error(message);
      }

      console.error('Login error:', message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0d1b10] to-[#071008] text-white px-6 py-10 relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-[#FF9933] opacity-20 rounded-full blur-3xl animate-pulse z-0"></div>
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#1A237E] opacity-20 rounded-full blur-2xl animate-pulse z-0"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#138808] opacity-20 rounded-full blur-2xl animate-ping z-0"></div>

      {/* Header */}
      <header className="z-10 relative mb-16 text-center">
        <h1 className="text-5xl font-extrabold text-[#FF9933] tracking-tight drop-shadow-xl">
          Goa Government Verification Portal
        </h1>
        <p className="text-gray-300 mt-4 max-w-xl mx-auto text-lg">
          Trusted access to verify and manage your official documents, powered by India's digital public infrastructure.
        </p>
      </header>

      {/* Main content */}
      <div className="z-10 relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Seamless. Secure. Smart.</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Built for citizens, students, and institutions to verify documents like IDs, licenses, education records, and more — all securely and digitally.
          </p>
        </motion.div>

        {/* Right login form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-[#1A237E] shadow-xl w-full max-w-md"
        >
          <h3 className="text-2xl font-semibold text-[#1A237E] text-center mb-6">
            Login to Your Account
          </h3>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#138808] hover:bg-green-700 py-2 rounded-md text-white font-semibold transition"
            >
              Login
            </button>

            <p className="text-sm text-gray-300 text-center">
              New user?{' '}
              <Link to="/signup" className="text-[#FF9933] hover:underline font-medium">
                Sign up here
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
