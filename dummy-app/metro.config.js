const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración para mejorar la conectividad
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configuración del servidor de desarrollo
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Permitir conexiones desde cualquier IP
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
