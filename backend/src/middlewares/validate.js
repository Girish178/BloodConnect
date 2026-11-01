const formatIssues = (error) =>
  error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");

// Validates req.body
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400);
    return next(new Error(formatIssues(result.error)));
  }
  req.body = result.data;
  next();
};

// Validates req.query, result is available as req.validatedQuery
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    res.status(400);
    return next(new Error(formatIssues(result.error)));
  }
  req.validatedQuery = result.data;
  next();
};