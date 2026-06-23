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

    // Replace only the request fields declared by the schema. Some route
    // validators only validate body and must keep Express params intact.
    if (parsed.data.body !== undefined) req.body = parsed.data.body;
    if (parsed.data.query !== undefined) req.query = parsed.data.query;
    if (parsed.data.params !== undefined) req.params = parsed.data.params;
    
    return next();
  } catch (error) {
    return next(error);
  }
};
