import * as tripsService from './trips.service.js';

export const createTrip = async (req, res, next) => {
  try {
    const result = await tripsService.createTrip(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Trip planned and vehicle/driver assigned',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTripStatus = async (req, res, next) => {
  try {
    const result = await tripsService.updateTripStatus(req.params.id, req.body.status, req.user);
    res.status(200).json({
      success: true,
      message: `Trip status updated to ${req.body.status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (req, res, next) => {
  try {
    const result = await tripsService.getTrips(req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const result = await tripsService.getTripById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
