const AWS = require( 'aws-sdk' );
const jwt = require( 'jsonwebtoken' );

var s3Bucket = new AWS.S3( { params: { Bucket: 'wns.sources' } } );

module.exports = {
  data: ( req, res, next ) => {
    req.data = req.data || {};
    next();
  },
  tokenAuth: ( req, res, next ) => {
    if ( !req.body.token )
      return res.status( 401 )
        .json( { success: false, message: 'Token required.' } )
        .end();
    jwt.verify( req.body.token, process.env.JWT_SECRET, ( err, decoded ) => {
      if ( err || !decoded.source_id )
        return res.status( 401 )
          .json( { success: false, message: 'Invalid token.' } )
          .end();
      req.data.source_id = decoded.source_id;
      next();
    });
  }
};
