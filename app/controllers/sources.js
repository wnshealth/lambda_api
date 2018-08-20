const AWS = require( 'aws-sdk' );
const uuid = require( 'uuid/v4' );

var s3Bucket = new AWS.S3( { params: { Bucket: 'wns.sources' } } );
var dynamoDb = new AWS.DynamoDB.DocumentClient();

class Sources {
  constructor() {}

  create( req, res, next ) {
    if ( !req.body.name )
      return res.status( 400 )
        .json( { error: 'Name required.' } )
        .end();
    req.data.source = {
      source_id: uuid(),
      name: req.body.name
    };
    req.data.token = jwt.sign( source, process.env.JWT_SECRET, {} );
    next();
  }

  dynamoDbPut( req, res, next ) {
    dynamoDb.put({
      TableName: 'wns.sources',
      Item: req.data.source
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

  s3Upload( req, res, next ) {
    var params = {
      Key: btoa( req.data.source.source_id ),
      Body: JSON.stringify( req.data ),
      ContentType: 'text/json',
      ACL: 'public-read'
    };

    this.s3Bucket.upload( params, ( err, data ) => {
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
    create: sources.create.bind( sources ),
    dynamoDbPut: sources.dynamoDbPut.bind( sources ),
    s3Upload: sources.s3Upload.bind( sources )
  };
})( new Sources() );
