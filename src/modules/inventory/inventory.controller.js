import * as inventoryService from './inventory.service.js';

export const createBatch = async (req, res, next) => {
  try {
    const result = await inventoryService.createBatch(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Inventory batch created and transaction logged',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBatch = async (req, res, next) => {
  try {
    const result = await inventoryService.updateBatch(req.params.id, req.body, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Inventory batch adjusted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (req, res, next) => {
  try {
    const result = await inventoryService.getInventory(req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBatchTransactions = async (req, res, next) => {
  try {
    const result = await inventoryService.getBatchTransactions(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
