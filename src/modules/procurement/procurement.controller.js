import * as procurementService from './procurement.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const result = await procurementService.createOrder(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Procurement order placed and invoice generated',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const result = await procurementService.updateOrderStatus(req.params.id, req.body.status, req.user);
    res.status(200).json({
      success: true,
      message: `Order status updated to ${req.body.status}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const result = await procurementService.getOrders(req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const result = await procurementService.getOrderById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
