const AWS = require( 'aws-sdk' );
const _ = require( 'lodash' );
const moment = require( 'moment' );

var dynamoDb = new AWS.DynamoDB.DocumentClient();

const SOURCE_MAP = {
  '8caf6d3b-1379-46a2-b931-f5a669cd87a0': 'Test',
  '91017dd5-e82a-4983-b6f9-b158f9c0106d': 'Zeeto',
  'f9fbf52d-f0fe-4adf-8ff6-34d67c4685d9': 'Fluent'
};

class Stats {
  constructor() {}

  dynamoDbQuery( req, res, next ) {
    var params = {
      TableName: 'wns.leads'
    };

    dynamoDb.scan( params, ( err, data ) => {
      if ( err ) { req.data.stats = err; return next(); };
      var date = req.query.date || moment().format( 'YYYY-MM-DD' );
      var stats = { created_at: date };
      var dateFilter = _.filter( data.Items, ( item ) => {
        return item.created_at === date;
      });
      dateFilter.forEach( ( item ) => {
        var source = SOURCE_MAP[ item.source_id ];
        stats[ source ] = stats[ source ] ? ++stats[ source ] : 1;
      });
      stats.total_leads = dateFilter.length;
      req.data.stats = stats;
      next();
    });
  }
}

module.exports = ( stats => {
  return {
    dynamoDbQuery: stats.dynamoDbQuery.bind( stats )
  };
})( new Stats() );
