import * as service from './reports.service.js';

export const getSummary = async (req, res, next) => {
  try {
    const result = await service.getReportSummary();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getFarmerLedger = async (req, res, next) => {
  try {
    const result = await service.getFarmerLedger(req.user.id, req.user.role);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getCustomerLedger = async (req, res, next) => {
  try {
    const result = await service.getCustomerLedger();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
