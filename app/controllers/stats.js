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
      stats.daily_total_lead_count = dateFilter.length;
      req.data.stats = stats;
      next();
    });
  }

  queryLeadsByWeek( req, res, next ) {
    var params = {
      TableName: 'wns.leads'
    };
    var cb = ( err, data ) => {
      if ( err )
        return res.status( 500 )
          .json( { success: false, error: err } )
          .end();

      req.data.items = req.data.items || [];
      req.data.items = _.concat( req.data.items, data.Items );
      if ( 'undefined' != typeof data.LastEvaluatedKey ) {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        dynamoDb.scan( params, cb );
      } else {
        this._weeklyDone( req, res, next );
      }
    }

    dynamoDb.scan( params, cb );
  }

  _weeklyDone( req, res, next ) {
    var date = moment();
    var stats = {
      created_at_dates: [
        {
          created_at_date: date.format( 'YYYY-MM-DD' ),
          sources: {},
          daily_total_lead_count: 0
        }
      ],
      weekly_total_lead_count: 0
    };
    var dates = [ date.format( 'YYYY-MM-DD' ) ];
    var l = 6;

    while ( l-- ) {
      let created_at_date = date.subtract( 1, 'day' ).format( 'YYYY-MM-DD' );
      dates.push( created_at_date );
      stats.created_at_dates.push({
        created_at_date: created_at_date,
        sources: {},
        daily_total_lead_count: 0
      });
    }

    req.data.items.forEach( ( item ) => {
      var created_at = item.created_at;
      var i = dates.indexOf( created_at );
      if ( i < 0 ) return false;
      var created_at_date = stats.created_at_dates[ i ];
      var source_id = item.source_id;
      var source_name = req.data.sourceMap[ source_id ];

      created_at_date.sources[ source_id ] = created_at_date.sources[ source_id ]
        || { source_name: source_name, lead_count: 0 };
      created_at_date.sources[ source_id ].lead_count += 1;
      created_at_date.daily_total_lead_count += 1;
      stats.weekly_total_lead_count += 1;
    });

    stats.i = req.data.items.length;
    req.data.stats = stats;
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
