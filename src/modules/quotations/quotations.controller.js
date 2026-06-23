import * as service from './quotations.service.js';
import { generateQuotationPdf } from '../../common/helpers/pdf-generator.js';

export const create = async (req, res, next) => {
  try {
    const extra = {};
    if ('quotations' === 'quotations') {
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

export const downloadPdf = async (req, res, next) => {
  try {
    const quotation = await service.getFullById(req.params.id);
    const pdfBuffer = await generateQuotationPdf(quotation);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=quotation-${quotation.id.slice(0, 8)}.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
