const AWS = require( 'aws-sdk' );
const request = require( 'request' );
const _ = require( 'lodash' );
const uuid = require( 'uuid/v4' );
const moment = require( 'moment' );

var dynamoDb = new AWS.DynamoDB.DocumentClient();

const REQUIRED = [
  'first_name',
  'last_name',
  'phone_number',
  'email',
  'state'
];

class Leads {
  constructor() {}

  validate( req, res, next ) {
    for ( let i = 0, l = REQUIRED.length; i < l; i++ )
      if ( !req.body[ REQUIRED[ i ] ] )
        return res.status( 500 )
          .json({
            success: false,
            message: REQUIRED[ i ] + ' required.'
          }).end();

    next();
  }

  create( req, res, next ) {
    var id = uuid();

    req.data.lead = _.extend({
      lead_id: id,
      uuid: id,
      source_id: req.data.source_id,
      access_key: 'fQWnG7VbE1aAFfkpe7FM',
      created_at: moment().format( 'YYYY-MM-DD' )
    }, req.body );
    console.log( req.data.lead );
    next();
  }

  test( req, res, next ) {
    if ( req.data.lead.test )
      return res.status( 200 )
        .json({
          success: true
        }).end();

    next();
  }

  dynamoDbPut( req, res, next ) {
    dynamoDb.put({
      TableName: 'wns.leads',
      Item: req.data.lead
    }, ( err, data ) => {
      if ( err ) {
        console.log( err );
        return res.status( 500 )
          .json({
            success: false,
            message: 'Could not create lead.'
          }).end();
      }
      next();
    });
  }

  send( req, res, next ) {
    var opts = {
      uri: 'https://mux.anomalysquared.com/wns/ib',
      method: 'POST',
      json: true,
      body: req.data.lead
    };

    request( opts, function( err, response, body ) {
      if ( err ) {
        console.log( err );
        return res.status( 500 )
          .json({
            success: false,
            message: 'Could send lead to call center.'
          }).end();
      }
      console.log( body );
      next();
    });
  }
}

module.exports = ( leads => {
  return {
    validate: leads.validate.bind( leads ),
    create: leads.create.bind( leads ),
    test: leads.test.bind( leads ),
    dynamoDbPut: leads.dynamoDbPut.bind( leads ),
    send: leads.send.bind( leads )
  };
})( new Leads() );
