import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role.name },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = async (user) => {
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  return token;
};

export const register = async ({ email, password, fullName, roleName }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict('Email is already registered');
  }

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    throw ApiError.badRequest(`Role '${roleName}' does not exist in the system`);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      roleId: role.id,
      isActive: roleName === 'ADMIN' || roleName === 'SUPERVISOR' ? true : false,
    },
    include: {
      role: true,
    },
  });

  // Automatically create Role-specific profile table entries if required
  if (roleName === 'DRIVER') {
    await prisma.driver.create({
      data: {
        userId: user.id,
        licenseNumber: `LIC-${user.id.slice(0, 8).toUpperCase()}`,
      },
    });
  } else if (roleName === 'SUPERVISOR') {
    await prisma.supervisor.create({
      data: {
        userId: user.id,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role.name,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account is pending admin approval');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
    },
    tokens: {
      accessToken,
      refreshToken: await refreshToken,
    },
  };
};

export const refresh = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: { role: true },
        },
      },
    });

    if (!dbToken || dbToken.revoked || new Date() > dbToken.expiresAt) {
      throw ApiError.unauthorized('Refresh token is invalid, expired, or revoked');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: { revoked: true },
    });

    // Generate new pair
    const accessToken = generateAccessToken(dbToken.user);
    const newRefreshToken = await generateRefreshToken(dbToken.user);

    return {
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };
  } catch (error) {
    throw ApiError.unauthorized('Invalid refresh token');
  }
};

export const logout = async (refreshToken) => {
  const dbToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (dbToken) {
    await prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: { revoked: true },
    });
  }
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role.name,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};
