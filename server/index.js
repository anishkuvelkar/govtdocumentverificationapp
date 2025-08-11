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
  origin: 'https://govtdocumentverificationapp-1p1zir3xu-anishkuvelkars-projects.vercel.app/', // your frontend URL
  credentials: true,               // allow cookies and credentials
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
// Routes
app.use('/', require('./routes/authRoutes'));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
