const AWS = require( 'aws-sdk' );
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
      created_at: moment().format( 'YYYY-MM-DD' );
    }, req.body );
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
    next();
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
