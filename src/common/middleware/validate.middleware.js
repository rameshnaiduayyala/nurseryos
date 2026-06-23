import ApiError from '../helpers/api-error.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map((err) => ({
        field: err.path.join('.').replace(/^(body|query|params)\./, ''),
        message: err.message,
      }));
      return next(ApiError.badRequest('Validation error', errorMessages));
    }

    // Replace request fields with validation-cleaned results
    req.body = parsed.data.body;
    req.query = parsed.data.query;
    req.params = parsed.data.params;
    
    return next();
  } catch (error) {
    return next(error);
  }
};
