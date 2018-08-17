const express = require( 'express' );

const middleware = require( __root + '/app/middleware' );
const sources = require( __root + '/app/controllers/sources.js' );

const router = express.Router();

router.get(
  '/yo',
  ( req, res ) => { res.sendStatus( 200 ); }
);

module.exports = app => app.use( router );
