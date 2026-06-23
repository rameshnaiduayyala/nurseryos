import * as service from './plans.service.js';

export const createPlan = async (req, res, next) => {
  try {
    const result = await service.createPlan(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Operational plan created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlans = async (req, res, next) => {
  try {
    const result = await service.getPlans(req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlanById = async (req, res, next) => {
  try {
    const result = await service.getPlanById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlanStatus = async (req, res, next) => {
  try {
    const result = await service.updatePlanStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    res.status(200).json({
      success: true,
      message: `Plan status updated to ${req.body.status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlanStopStatus = async (req, res, next) => {
  try {
    const result = await service.updatePlanStopStatus(
      req.params.id,
      req.params.stopId,
      req.body.status,
      req.user
    );
    res.status(200).json({
      success: true,
      message: `Stop status updated to ${req.body.status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlanAvailability = async (req, res, next) => {
  try {
    const result = await service.getPlantAvailabilityForPlan(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
