const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Access token expires in 7 days
  });

  const refreshToken = jwt.sign({ userId, isRefreshToken: true }, process.env.JWT_SECRET, {
    expiresIn: '90d', // Refresh token expires in 90 days
  });

  return { accessToken, refreshToken };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};

