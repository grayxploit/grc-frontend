const { config } = require('dotenv');
const { resolve } = require('node:path');

config({ path: resolve(__dirname, '.env') });

const target = process.env.API_URL || 'http://127.0.0.1:8000';

/** @type {import('vite').ProxyOptions} */
module.exports = {
  '/api/**': {
    target,
    secure: false,
    changeOrigin: true,
  },
};
