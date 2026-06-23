import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';

export const createNotification = async (data) => {
  const { userId, title, message, type, referenceId, referenceType } = data;

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: type || 'SYSTEM',
      referenceId,
      referenceType,
    },
  });

  return notification;
};

export const getNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getUnreadCount = async (userId) => {
  return prisma.notification.count({
    where: { userId, read: false },
  });
};

export const markAsRead = async (id, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  if (notification.userId !== userId) {
    throw ApiError.forbidden('Forbidden to update this notification');
  }

  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
};

export const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
};

export const deleteNotification = async (id, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  if (notification.userId !== userId) {
    throw ApiError.forbidden('Forbidden to delete this notification');
  }

  await prisma.notification.delete({ where: { id } });
  return { success: true };
};

export const notifyRole = async (roleName, title, message, type, referenceId, referenceType) => {
  const users = await prisma.user.findMany({
    where: {
      role: { name: roleName },
      isActive: true,
    },
    select: { id: true },
  });

  const notifications = [];
  for (const user of users) {
    notifications.push(
      createNotification({
        userId: user.id,
        title,
        message,
        type,
        referenceId,
        referenceType,
      })
    );
  }

  return Promise.all(notifications);
};
