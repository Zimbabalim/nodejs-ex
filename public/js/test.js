(function foo(){
    console.log("/test/ -function ");

    var _props = {};
    _props.url = "./api/test";
    _props.data = { zoom : "boom", loom : "tomb" };

    var vo = {

        method : _props.method || "GET",
        url : _props.url,
        data : _props.data || "",
        dataType : _props.dataType || "json"
    };


    $.ajax({
        type : vo.method,
        url : vo.url,
        data : vo.data,
        dataType : vo.dataType,

        success : function( _r ) {
            onResult( true, _r );
        },

        error : function( _error ) {
            onResult( false, _error );
        }
    });

    function onResult( _a, _b ){
        console.log("/test/ -onResult ", _a, _b );
    }
    
    
}());