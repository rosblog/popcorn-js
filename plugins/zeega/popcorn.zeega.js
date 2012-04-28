// pop.zeega( ..... [ 10, 10, 10,

(function( Popcorn ) {
  Popcorn.plugin( "zeega", function() {
    // one time Setup
    var ZeegaScriptURL = "http://somewhere",

    // Ready called by Zeega player
    zeegaReady = function( options ) {
      var fto = options.frameTimeout || 10;
      for ( var i = 0, len = options._zeega.frameCount; i < len; i++ ) {
        createFrameAdvance( options, fto + ( i * fto ) );
      }
    },

    // Call end manually
    zeegaEnded = function() {
      options._natives.end && options._natives.end();
    },

    createZeega = function( options ) {
      options._zeega = new Zeega( options.target, function() {
        zeegaEnded( options );
      }, function() {
        zeegaReady( options );
      });
    },

    createFrameAdvance = function( options, time ) {
      options._frameAdvanceIds.push(
        SetTimeout( function() {
          options._zeega && options._zeega.advanceFrame();
        }, time );
      );
    };

    return {
      start: function( options ) {

      },
      end: function( options ) {
        Popcorn.forEach( options._frameAdvanceIds, function( id ) {
          clearTimeout( id );
        });
      },
      _setup:function( options ) {
        if ( !window.Zeega ) {
          Popcorn.getScript( ZeegaScriptURL, function() {
            createZeega( options );
          });
        } else {
          createZeega( options );
        }
      },
      _teardown( options ){
        // Will need for Butter/Popcorn Maker
        //options._zeega.teardown();
      },
      toString( options ) {

      }

    };
  });
}( Popcorn );