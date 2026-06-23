import * as nurseriesService from './nurseries.service.js';

export const createNursery = async (req, res, next) => {
  try {
    const result = await nurseriesService.createNursery(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Nursery registered successfully and is pending approval',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const approveNursery = async (req, res, next) => {
  try {
    const result = await nurseriesService.approveNursery(req.params.id, req.body.isApproved);
    res.status(200).json({
      success: true,
      message: `Nursery approval status updated to ${req.body.isApproved}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNurseries = async (req, res, next) => {
  try {
    const result = await nurseriesService.getNurseries(req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyNurseries = async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const result = await nurseriesService.getNearbyNurseries(latitude, longitude, radius);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getNurseryById = async (req, res, next) => {
  try {
    const result = await nurseriesService.getNurseryById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNursery = async (req, res, next) => {
  try {
    const result = await nurseriesService.updateNursery(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Nursery updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNursery = async (req, res, next) => {
  try {
    await nurseriesService.deleteNursery(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Nursery deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
