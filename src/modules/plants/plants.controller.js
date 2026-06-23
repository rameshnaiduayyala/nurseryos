import * as plantsService from './plants.service.js';

export const createPlant = async (req, res, next) => {
  try {
    const result = await plantsService.createPlant(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Plant created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlants = async (req, res, next) => {
  try {
    const result = await plantsService.getPlants(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSuggestions = async (req, res, next) => {
  try {
    const result = await plantsService.getSuggestions(req.query.q, parseInt(req.query.limit) || 10, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlantById = async (req, res, next) => {
  try {
    const result = await plantsService.getPlantById(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlant = async (req, res, next) => {
  try {
    const result = await plantsService.updatePlant(req.params.id, req.body, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: 'Plant updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlant = async (req, res, next) => {
  try {
    await plantsService.deletePlant(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: 'Plant deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
