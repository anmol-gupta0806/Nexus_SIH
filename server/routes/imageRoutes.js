const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const imageController = require('../controllers/imageController');

// Process image upload or selected Copernicus sample
router.post('/upload', upload.single('satellite_image'), (req, res, next) => {
  imageController.processImage(req, res, next);
});

// Process endpoint accepting sample or pre-uploaded raster
router.post('/process', upload.single('satellite_image'), (req, res, next) => {
  imageController.processImage(req, res, next);
});

// Get the latest processed super-resolution result
router.get('/latest', (req, res) => {
  imageController.getLatestResult(req, res);
});

// Get available Copernicus Sentinel-2 sample scenes
router.get('/samples', (req, res) => {
  imageController.getSamples(req, res);
});

// Get history of processed scenes
router.get('/history', (req, res) => {
  imageController.getHistory(req, res);
});

module.exports = router;
