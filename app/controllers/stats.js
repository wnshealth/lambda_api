const AWS = require( 'aws-sdk' );
const _ = require( 'lodash' );
const moment = require( 'moment' );

var dynamoDb = new AWS.DynamoDB.DocumentClient();

class Stats {
  constructor() {}

  scanSources( req, res, next ) {
    var params = {
      TableName: 'wns.sources'
    };

    dynamoDb.scan( params, ( err, data ) => {
      if ( err )
        return res.status( 500 )
          .json( { success: false, error: err } )
          .end();
      var sources = req.data.sources = data.Items;
      var sourceMap = req.data.sourceMap = {};

      sources.forEach( ( item ) => {
        sourceMap[ item.source_id ] = item.name;
      });

      next();
    });
  }

  queryLeadsByDay( req, res, next ) {
    var params = {
      TableName: 'wns.leads'
    };

    dynamoDb.scan( params, ( err, data ) => {
      if ( err )
        return res.status( 500 )
          .json( { success: false, error: err } )
          .end();
      var date = req.query.date || moment().format( 'YYYY-MM-DD' );
      var stats = { created_at_date: date, sources: {} };
      var dateFilter = _.filter( data.Items, ( item ) => {
        return item.created_at === date;
      });

      dateFilter.forEach( ( item ) => {
        var source_id = item.source_id;
        var source_name = req.data.sourceMap[ source_id ];

        stats.sources[ source_id ] = stats.sources[ source_id ]
          || { source_name: source_name, lead_count: 0 };
        stats.sources[ source_id ].lead_count += 1;
      });
      stats.total_lead_count = dateFilter.length;
      req.data.stats = stats;
      next();
    });
  }

  queryLeadsByWeek( req, res, next ) {
    next();
  }
}

module.exports = ( stats => {
  return {
    scanSources: stats.scanSources.bind( stats ),
    queryLeadsByDay: stats.queryLeadsByDay.bind( stats ),
    queryLeadsByWeek: stats.queryLeadsByWeek.bind( stats )
  };
})( new Stats() );
