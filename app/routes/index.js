const express = require( 'express' );

const middleware = require( __root + '/app/middleware' );
const sources = require( __root + '/app/controllers/sources' );
const leads = require( __root + '/app/controllers/leads' );

const router = express.Router();

router.get(
  '/v1/ping',
  ( req, res ) => { res.sendStatus( 200 ); }
);

router.post(
  '/v1/sources',
  middleware.data,
  sources.create,
  sources.dynamoDbPut,
  sources.s3Upload,
  ( req, res ) => { res.sendStatus( 200 ); }
);

router.post(
  '/v1/leads',
  middleware.data,
  middleware.tokenAuth,
  leads.validate,
  leads.create,
  leads.dynamoDbPut,
  leads.send,
  ( req, res ) => {
    return res.status( 200 )
      .json({
        success: true
      }).end();
  }
);

module.exports = app => app.use( router );
