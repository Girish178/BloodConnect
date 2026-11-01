export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403);
  next(new Error("Admin access required"));
};

export const verifierOrAdmin = (req, res, next) => {
  if (req.user && ["verifier", "admin"].includes(req.user.role)) return next();
  res.status(403);
  next(new Error("Verifier or admin access required"));
};