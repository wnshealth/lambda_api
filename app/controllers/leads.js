const AWS = require( 'aws-sdk' );
const request = require( 'request' );
const _ = require( 'lodash' );
const uuid = require( 'uuid/v4' );
const moment = require( 'moment' );

var dynamoDb = new AWS.DynamoDB.DocumentClient();

class Leads {
  constructor() {}

  validate( req, res, next ) {
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
    if ( req.data.lead.test )
      return res.status( 200 )
        .json({
          success: true
        }).end();
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
            message: 'Could send to call center.'
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
    dynamoDbPut: leads.dynamoDbPut.bind( leads ),
    send: leads.send.bind( leads )
  };
})( new Leads() );
