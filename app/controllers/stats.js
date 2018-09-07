const AWS = require( 'aws-sdk' );
const _ = require( 'lodash' );
const moment = require( 'moment' );

var dynamoDb = new AWS.DynamoDB.DocumentClient();

class Stats {
  constructor() {}

  dynamoDbQuery( req, res, next ) {
    var params = {
      ExpressionAttributeValues: {
        ':d': { S: moment().format( 'YYYY-MM-DD' ) },
       },
      KeyConditionExpression: 'created_at = :d',
      TableName: 'wns.leads'
    };

    dynamoDb.query( params, ( err, data ) => {
      if ( err ) return req.data.stats = err;
      data.Items.forEach( ( el, i, arr ) => {} );
      req.data.stats = data.Items;
    });
  }
}

module.exports = ( leads => {
  return {
    dynamoDbQuery: leads.dynamoDbQuery.bind( leads )
  };
})( new Stats() );
