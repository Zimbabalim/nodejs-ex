
var express = require("express"),
    router = express.Router();

var fs = require('fs');
var _ = require('lodash');

/*router.get("/", function( req, res ){
    console.log("***************************");
    console.log("NEW SESSION", Date.now() );
    console.log("***************************");
    res.render( "index.ejs" );
});*/

/*router.get("/admin", function( req, res ){
    res.render( "./../public/CMS/index.html" );
});*/

// *** Users ***

/**
 * USER SWATCHES
 * /api/cms/users/initial-population
 * write-swatches
 */
/*router.get("/api/cms/users/initial-population", function ( req, res ) {

    var db = req.db;
    var users = db.get( "users" );

    users.find( { _id : req.query.uid }, {}, function ( e, docs ) {

        var vo = docs[ 0 ];
        var f = _.has( vo, "swatches" );

        if( f ){
            // console.log("/index/ -initial-population : HAS SWATCHES PROP - quit");
        } else {
            // console.log("/index/ -initial-population : SHOULD CREATE SWATCHES PROP", req.query.swatches );
            users.findOneAndUpdate( { _id : req.query.uid }, { $set: { swatches: req.query.swatches }} );
        }

        console.log("/index/ - initial-population:", "user", vo.email, "added swatches?", !f );
        res.json( { "added_swatches_prop" : !f } );
    });
});*/

/*router.get("/api/cms/users/write-swatches", function ( req, res ) {

    var db = req.db;
    var users = db.get( "users" );

    console.log("/index/ - write-swatches:", req.query.uid, req.query.swatches );

    users.findOneAndUpdate( { _id : req.query.uid }, { $set: { swatches: req.query.swatches || [] }} );

    res.json( { "swatches_modified" : req.query.swatches } );

});*/


/**
 * GET ALL USERS
 */
/*router.get("/api/cms/users/get-all", function ( req, res ) {

    var db = req.db;
    var data = db.get( "users" );

    data.find({},{},function( e, docs ){
        res.json(docs);
    });
});*/

/**
 * ADD A USER
 */
/*router.get("/api/cms/users/add-user", function ( req, res ) {

    var db = req.db;
    var users = db.get( "users" );

    if( req.query["email"] ){
        users.insert( req.query );
    } else {
        console.log("/index/ - FAIL");
    }

    users.find({},{},function( e, docs ){
        res.json(docs);
    });
});*/

/**
 * DELETE A USER (by _id)
 */
/*router.get("/api/cms/users/delete-user", function ( req, res ) { // TODO - generic service

    console.log("/index/ - USER DELETE", req.query.dbid );

    var db = req.db;
    var data = db.get( "users" );

    data.remove({ _id: req.query.dbid });

    data.find({},{},function( e, docs ){
        res.json(docs);
    });
});*/


// *** Sundries ***


/*router.get("/api/cms/sundries/get-all", function ( req, res ) {

    var db = req.db;
    var data = db.get( "sundries" );

    data.find({},{},function( e, docs ){
        res.json(docs);
    });
});*/


/*router.get("/api/cms/sundries/add-story", function ( req, res ) {

    var db = req.db;
    var data = db.get( "sundries" );

    req.query.date = getPrettyDate();
    console.log("/index/ - ************", req.query );

    data.insert( req.query );

    data.find({},{},function( e, docs ){
        res.json(docs);
    });
});*/


/*router.get("/api/cms/sundries/delete-story", function ( req, res ) {

    console.log("/index/ - STORY DELETE", req.query.dbid );

    var db = req.db;
    var data = db.get( "sundries" );

    data.remove({ _id: req.query.dbid });

    data.find({},{},function( e, docs ){
        res.json(docs);
    });
});*/


/*router.post("/api/cms/sundries/upload-image", function ( req, res ) {

    console.log("/index/ - UPLOAD IMAGE", req.files.image );

    var source = fs.createReadStream( req.files.image.file );
    var dest = fs.createWriteStream( "./public/assets/images/sundries/" + req.files.image.filename );

    console.log("/index/ - ********", source.path );

    source.pipe(dest);
    source.on('end', function() {
        /!* copied *!/
        console.log("/index/ - IMAGE SAVED");
        res.json( { image : req.files.image.filename } );
    });
    source.on('error', function(err) { /!* error *!/ });
});*/

// =================

// *** UTILS

/*var getPrettyDate = function () {

    var r,
        d = new Date().toDateString(),
        z = d.split(" ");

    r = z[ 2 ] + " " + z[ 1 ] + " " + z[ 3 ];

    return r;
};*/


module.exports = router;
