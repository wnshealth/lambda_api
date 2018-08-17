const express = require( 'express' );
const cors = require( 'cors' );
const bodyParser = require( 'body-parser' );

const config = require( './config' );
const routes = require( './app/routes' );

var app = express();

app.set( 'name', 'lambda_api' );
app.use( cors() );
app.use( bodyParser.json() );

routes( app );

app.listen( 1337, () => {
  console.log( app.get( 'name' ) + ' processing.' );
});

module.exports = app;
