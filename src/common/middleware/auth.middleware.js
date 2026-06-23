import jwt from 'jsonwebtoken';
import ApiError from '../helpers/api-error.js';
import prisma from '../../config/database.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Access token is missing or invalid format'));
    }

    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_ACCESS_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return next(ApiError.unauthorized('Access token has expired'));
        }
        return next(ApiError.unauthorized('Invalid access token'));
      }
      
      try {
        // Real-time deactivation check
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          include: { role: true },
        });

        if (!user || !user.isActive) {
          return next(ApiError.unauthorized('User account has been deactivated or not found'));
        }

        req.user = {
          id: user.id,
          email: user.email,
          role: user.role.name,
        };
        
        next();
      } catch (dbError) {
        next(dbError);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this resource`));
    }

    next();
  };
};
