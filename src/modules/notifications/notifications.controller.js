import * as service from './notifications.service.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const result = await service.getNotifications(req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const result = await service.getUnreadCount(req.user.id);
    res.status(200).json({
      success: true,
      data: { unreadCount: result },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const result = await service.markAsRead(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await service.markAllAsRead(req.user.id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const result = await service.deleteNotification(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
