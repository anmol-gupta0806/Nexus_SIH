const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/nexus_sih',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  JWT_SECRET: process.env.JWT_SECRET || 'nexus_sih_jwt_secret_satellite_super_res',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  UPLOAD_PATH: path.resolve(__dirname, '../../data/raw/sentinel2'),
  OUTPUT_PATH: path.resolve(__dirname, '../../data/outputs'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '150', 10)
};
