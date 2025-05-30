import { decodeToken } from '../utils/jwt.js';

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];

  if (authHeader) {
    // Split 'Bearer token'
    const [type, token] = authHeader.split(' ');
    
    try {
      if (type === 'Bearer' && token) {
        // Verify token
        const userData = decodeToken(token);
        
        // Add user data to request object
        req.user = userData;
        next();
        return;
      }
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authenticated' });
};

export default authMiddleware;