const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { ML_SERVICE_URL } = require('../config/env');
const axios = require('axios');

// System Health Check
router.get('/health', async (req, res) => {
  let mlServiceStatus = 'offline';
  try {
    const mlHealth = await axios.get(`${ML_SERVICE_URL}/api/v1/health`, { timeout: 1500 });
    if (mlHealth.data && mlHealth.data.status === 'online') {
      mlServiceStatus = 'online';
    }
  } catch (err) {
    mlServiceStatus = 'unreachable';
  }

  res.json({
    status: 'online',
    service: 'Nexus Express API Server',
    timestamp: new Date().toISOString(),
    ml_service: {
      status: mlServiceStatus,
      url: ML_SERVICE_URL
    },
    version: '1.0.0'
  });
});

// Mock/Default Dashboard Stats
router.get('/dashboard/stats', (req, res) => {
  res.json({
    totalImagesProcessed: 148,
    activeJobs: 2,
    avgPsnr: 32.1,
    avgSsim: 0.884,
    storageUsedGb: 14.6,
    modelsAvailable: ['SRGAN', 'GeoDiffusion-SR', 'SwinIR Transformer']
  });
});

// Image Upload Endpoint
router.post('/images/upload', upload.single('satellite_image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  res.status(201).json({
    message: 'Satellite image uploaded successfully',
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    }
  });
});

module.exports = router;
