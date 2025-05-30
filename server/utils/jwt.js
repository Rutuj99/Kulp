import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      location: user.location
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Decode JWT token
export const decodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};