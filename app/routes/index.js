const express = require( 'express' );

const middleware = require( __root + '/app/middleware' );
const sources = require( __root + '/app/controllers/sources.js' );

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

module.exports = app => app.use( router );
