// routes/authRoutes.js
const express = require('express');
const router = express.Router();
// const cors = require('cors'); // Remove this line
const {test,registerUser,logoutUser,loginUser,getProfile,submitRequest, getMyRequests,uploadToUploadcare,getAdmin1Requests, approveRequest, rejectRequest,getAdmin2Requests,approveByAdmin2,rejectByAdmin2} = require('../controllers/authControllers')
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// REMOVE THIS ENTIRE SECTION:
// router.use(
//   cors({
//     credentials: true,
//     origin: 'http://localhost:5173'
//   })
// );

router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getProfile);
router.get('/my-requests', getMyRequests);
router.post('/upload', upload.single('file'), uploadToUploadcare);
router.post("/submit-request", submitRequest);
router.get('/admin1/requests', getAdmin1Requests);
router.post('/admin1/request/:id/approve', approveRequest);
router.post('/admin1/request/:id/reject', rejectRequest);
router.get("/admin2/requests", getAdmin2Requests);
router.post("/admin2/request/:id/approve", approveByAdmin2);
router.post("/admin2/request/:id/reject", rejectByAdmin2);
router.post("/logout", logoutUser);

module.exports = router;