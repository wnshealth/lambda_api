const AWS = require( 'aws-sdk' );
const uuid = require( 'uuid/v4' );

var dynamoDb = new AWS.DynamoDB.DocumentClient();

class Sources {
  constructor() {}

  create( req, res, next ) {
    if ( !req.body.name )
      return res.status( 400 )
        .json( { error: 'Name required.' } )
        .end();
    var source = {
      source_id: uuid(),
      name: req.body.name
    };

    dynamoDb.put({
      TableName: 'wns.sources',
      Item: source
    }, ( err, data ) => {
      if ( err ) {
        console.log( err );
        return res.status( 500 )
          .json( { error: 'Could not create source.' } )
          .end();
      }
      next();
    });
  }
}

module.exports = ( sources => {
  return {
    create: sources.create.bind( sources )
  };
})( new Sources() );
