import * as reservationsService from './reservations.service.js';

export const createReservation = async (req, res, next) => {
  try {
    const result = await reservationsService.createReservation(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Stock reserved successfully (Pending farmer approval)',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatus = async (req, res, next) => {
  try {
    const result = await reservationsService.updateReservationStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    res.status(200).json({
      success: true,
      message: `Reservation status updated to ${req.body.status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getReservations = async (req, res, next) => {
  try {
    const result = await reservationsService.getReservations(req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (req, res, next) => {
  try {
    const result = await reservationsService.getReservationById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
