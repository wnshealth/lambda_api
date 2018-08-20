module.exports = {
  tokenAuth: ( req, res, next ) => { next(); },

  data: ( req, res, next ) => {
    req.data = req.data || {};
    next();
  }
};
