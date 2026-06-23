import * as service from './dashboard.service.js';

export const getSummary = async (req, res, next) => {
  try {
    const result = await service.getDashboardStats(req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
