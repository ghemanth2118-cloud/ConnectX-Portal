const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();


// router.post('/update-image', upload.single('image'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }
//   const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//   res.status(200).json({ imageUrl });
// });

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

module.exports = router;
