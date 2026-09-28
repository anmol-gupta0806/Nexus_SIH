import api from './api';

export const imageService = {
  // Upload a raster file and run super-resolution pipeline
  async uploadAndProcess(formData) {
    return await api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Process a selected Copernicus sample raster without re-uploading
  async processSample(params) {
    return await api.post('/images/process', params);
  },

  // Fetch the latest processed result
  async getLatestResult() {
    return await api.get('/images/latest');
  },

  // Get available Copernicus Sentinel-2 sample scenes
  async getSamples() {
    return await api.get('/images/samples');
  },

  // Get processing history
  async getHistory() {
    return await api.get('/images/history');
  }
};

export default imageService;
