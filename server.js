//  OpenShift sample Node application
// @as : adapt for hopkins
var express = require('express'),
    app     = express(),
    morgan  = require('morgan'); // @as removed

// @as
var fs = require( "fs" );
var path = require( "path" );
var routes = require( "./routes/index" ); // RESTORE
var mongo = require('mongodb');
var monk = require('monk');
var bb = require('express-busboy');
// ===

console.log('/server/ - @as:1857 >>');
Object.assign=require('object-assign');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined')); //@as removed

// @as added
app.use( express.static( path.join( __dirname, "public" )));
bb.extend( app, {
    upload : true,
    path: "./public/_upload-temp"
} ); // RESTORE
app.use( "/", routes); // @as removed RESTORE
// ===


var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

console.log('/server/ -process.env.OPENSHIFT_MONGODB_DB_URL:', process.env.OPENSHIFT_MONGODB_DB_URL);

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {

    /* ORIGINAL */
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

    /* OVERRIDE doesn't work!!! */
    /*var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
        mongoPassword =  '1S2AbbSpJNZe';
    mongoUser = 'admin';*/

    console.log('/server/ --mongoServiceName:', mongoServiceName);
    console.log('/server/ --mongoHost:', mongoHost);
    console.log('/server/ --mongoPort:', mongoPort);
    console.log('/server/ --mongoDatabase:', mongoDatabase);
    console.log('/server/ --mongoPassword:', mongoPassword);
    console.log('/server/ --mongoUser:', mongoUser);


    /*
    /server/ -mongoServiceName: MONGODB
    /server/ -mongoHost: 172.30.155.209
    /server/ -mongoPort: 27017
    /server/ -mongoDatabase: staging
    /server/ -mongoPassword: q1CXhcw3HYQC7PlP
    /server/ -mongoUser: userNXJ
    /server/ -initDb --mongoURL: mongodb://userNXJ:q1CXhcw3HYQC7PlP@172.30.155.209:27017/staging
     */
    //mongodb://userNXJ:q1CXhcw3HYQC7PlP@172.30.155.209:27017/staging


    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

    }
}

// @as : TEST override mongourl


var db = null,
    dbDetails = new Object();

var initDb = function(callback) {

    // console.log('/server/ -initDb --disable db connect');
    // return; // REMOVE - TEST disable db connect

    console.log('/server/ -initDb --mongoURL:', mongoURL);

    if (mongoURL == null) {
        return;
    }

    var mongodb = require('mongodb');

    console.log('/server/ -initDb', mongodb);
    // if (mongodb == null) return;

    console.log('/server/ -initDb --attempt connect');

    /*mongodb.connect(mongoURL, function(err, conn) {
        if (err) {
            callback(err);
            return;
        }

        db = conn;
        // dbDetails.databaseName = db.databaseName;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = mongoURLLabel;
        dbDetails.type = 'MongoDB';

        console.log('/server/ -CONNECT?', dbDetails);
        console.log('Connected to MongoDB at: %s', mongoURL);
    });*/



    db = monk( mongoURL ); // @as ADDED
    console.log('/server/ -initDb ???', db);
};

/**
 * stub this call for the http probes (liveness, readiness), otherwise pod won't deploy
 */
app.get('/pagecount', function (req, res) {
    res.send('{ pageCount: -1 }');
});

// error handling
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something bad happened!');
});

initDb(function(err){
    console.log('Error connecting to Mongo. Message:\n'+err);
});

app.use(function( req, res, next ){

    req.db = db;
    console.log('/server/ -APP USE DB?', db, req.db);
    next();
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
console.log('/server/ - <<');




// ========

console.log('/server/ -WHERE IS THE DB?', db, '<<<');

app.get("/api/gateway/validate-login", function ( req, res ) {

    /*if (!db) {
        console.log('/server/ -TRY CONNECT AGAIN TO DB');
        initDb(function(err){});
    }*/

    console.log('==== /server/ -GET GATEWAY LOGIN ====');
    // var db = req.db;
    console.log('/server/ - GET GATEWAY LOGIN -db?', db);
    var data = db.get( "users" );
    console.log('/server/ - GET GATEWAY LOGIN -data?', data);

    console.log("/server/ - validate-login:", req.query.email.toLowerCase() );

    data.find({ email : req.query.email.toLowerCase() },{},function( e, docs ){
        res.json(docs);
        // console.log("/index/ - RESULT", docs );
    });
});







































// ==============================

module.exports = app ;
