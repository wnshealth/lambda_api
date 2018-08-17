global.__root = __dirname;

const awsse = require( 'aws-serverless-express' );

const app = require( './app' );

exports.handler = ( event, context ) => {
  console.log( JSON.stringify( event ) );
  awsse.proxy( awsse.createServer( app ), event, context );
}
