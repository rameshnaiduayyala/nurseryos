import * as service from './pos-sales.service.js';

export const createPosSale = async (req, res, next) => {
  try {
    const result = await service.createPosSale(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'POS sale recorded and stock deducted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPosSales = async (req, res, next) => {
  try {
    const result = await service.getPosSales(req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPosSaleById = async (req, res, next) => {
  try {
    const result = await service.getPosSaleById(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const printReceipt = async (req, res, next) => {
  try {
    const sale = await service.getPosSaleById(req.params.id, req.user.id);
    const html = service.generateHtmlReceipt(sale);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    next(error);
  }
};
