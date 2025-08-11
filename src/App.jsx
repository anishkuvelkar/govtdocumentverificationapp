import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

import { UserContextProvider } from '../context/userContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Signup from './pages/Signup';
import Admintwo from './pages/Admintwo';   
import Adminone from './pages/adminone';
import People from './pages/People';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

function App() {
  return (
    <Router>  {/* <-- Router moved up */}
      <UserContextProvider>
        <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/admin1"
            element={
              <ProtectedRoute>
                <Adminone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admintwo"
            element={
              <ProtectedRoute>
                <Admintwo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <People />
              </ProtectedRoute>
            }
          />
        </Routes>
      </UserContextProvider>
    </Router>
  );
}

export default App;
