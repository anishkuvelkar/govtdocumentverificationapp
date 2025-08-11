const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const cookieParser = require('cookie-parser');

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Database not connected', err));

// Manual CORS handling with pattern matching for all Vercel deployments
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('=== CORS HANDLER ===');
  console.log('Method:', req.method);
  console.log('Origin:', origin);
  console.log('URL:', req.url);
  
  const allowedOrigins = [
    'http://localhost:5173'
  ];
  
  // Check if origin matches your Vercel pattern - matches ANY Vercel deployment
  const isVercelOrigin = origin && origin.match(/^https:\/\/govtdocumentverificationapp-.*-anishkuvelkars-projects\.vercel\.app$/);
  
  if (allowedOrigins.includes(origin) || isVercelOrigin) {
    console.log('✅ Origin allowed:', origin);
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Accept-Language,Accept-Encoding,x-vercel-skip-toolbar');
  } else {
    console.log('❌ Origin blocked:', origin);
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request - sending 200 OK');
    res.status(200).end();
    return;
  }
  
  console.log('===================');
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

// Request debugging middleware
app.use((req, res, next) => {
  console.log('=== REQUEST DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.get('origin'));
  console.log('===================');
  next();
});

// Debug endpoint to test CORS
app.get('/debug-cors', (req, res) => {
  res.json({
    message: 'Manual CORS enabled with pattern matching',
    timestamp: new Date().toISOString(),
    yourOrigin: req.get('origin')
  });
});

// Routes
app.use('/', require('./routes/authRoutes'));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));