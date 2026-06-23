import * as service from './approval-requests.service.js';

export const createApprovalRequest = async (req, res, next) => {
  try {
    const result = await service.createApprovalRequest(
      req.body,
      req.user.id,
      req.user.role
    );
    res.status(201).json({
      success: true,
      message: 'Approval request submitted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovalRequests = async (req, res, next) => {
  try {
    const result = await service.getApprovalRequests(req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovalRequestById = async (req, res, next) => {
  try {
    const result = await service.getApprovalRequestById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewApprovalRequest = async (req, res, next) => {
  try {
    const result = await service.reviewApprovalRequest(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.status,
      req.body.reviewNote
    );
    res.status(200).json({
      success: true,
      message: `Approval request ${req.body.status.toLowerCase()}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
