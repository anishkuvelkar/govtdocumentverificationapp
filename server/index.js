const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const cookieParser = require('cookie-parser');


mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Database not connected', err));

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://govtdocumentverificationapp-1p1zir3xu-anishkuvelkars-projects.vercel.app',    // without slash
    'https://govtdocumentverificationapp-1p1zir3xu-anishkuvelkars-projects.vercel.app/'   // with slash
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

app.use((req, res, next) => {
  console.log('=== REQUEST DEBUG ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.get('origin'));
  console.log('Headers:', req.headers);
  console.log('===================');
  next();
});
// Routes
app.get('/debug-cors', (req, res) => {
  res.json({
    corsOrigins: corsOptions.origin,
    timestamp: new Date().toISOString(),
    message: 'CORS debug info'
  });
});
app.use('/', require('./routes/authRoutes'));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
