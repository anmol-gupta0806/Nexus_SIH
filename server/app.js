const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const corsOptions = require('./config/cors');
const routes = require('./routes');
const { OUTPUT_PATH, UPLOAD_PATH } = require('./config/env');

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static serving for outputs and uploads previews
app.use('/static/outputs', express.static(OUTPUT_PATH));
app.use('/static/uploads', express.static(UPLOAD_PATH));

// Mount main API
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
