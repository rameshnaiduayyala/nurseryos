import * as service from './users.service.js';

export const create = async (req, res, next) => {
  try {
    const extra = {};
    if ('users' === 'quotations') {
      extra.exporterId = req.user.id;
    }
    const result = await service.create(req.body, extra);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const result = await service.getAll();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const result = await service.getById(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const result = await service.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const approve = async (req, res, next) => {
  try {
    const result = await service.approve(req.params.id);
    res.status(200).json({ success: true, message: 'User account approved successfully', data: result });
  } catch (error) {
    next(error);
  }
};
