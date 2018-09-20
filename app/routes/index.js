const express = require( 'express' );

const middleware = require( __root + '/app/middleware' );
const sources = require( __root + '/app/controllers/sources' );
const leads = require( __root + '/app/controllers/leads' );
const stats = require( __root + '/app/controllers/stats' );

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
  leads.test,
  leads.dynamoDbPut,
  leads.send,
  ( req, res ) => {
    return res.status( 200 )
      .json({
        success: true
      }).end();
  }
);

router.get(
  '/v1/stats',
  middleware.data,
  ( req, res, next ) => {
    req.query.token === process.env.WNS_TOKEN
      ? next()
      : res.status( 401 )
          .json( { success: false, message: 'Invalid token.' } )
          .end();
  },
  ( req, res ) => {
    res.status( 200 )
      .json( {} )
      .end();
  }
)

router.get(
  '/v1/stats/daily',
  middleware.data,
  ( req, res, next ) => {
    req.query.token === process.env.WNS_TOKEN
      ? next()
      : res.status( 401 )
          .json( { success: false, message: 'Invalid token.' } )
          .end();
  },
  stats.scanSources,
  stats.queryLeadsByDay,
  ( req, res ) => {
    res.status( 200 )
      .json( req.data.stats )
      .end();
  }
)

module.exports = app => app.use( router );
