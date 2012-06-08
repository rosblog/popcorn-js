(function( Popcorn ) {

  var loadInProgress = false,
      firework_template = false;

  function load() {
    if ( loadInProgress ) {
      return;
    }
    loadInProgress = true;
    var ft, fw, fp, css;
  
    ft = document.createElement( "div" );
    fw = document.createElement( "div" );
    fp = document.createElement( "div" );
    fc = document.createElement( "div" );
    img = document.createElement( "img" );

    ft.id = "fireworks-template";
    fw.id = "fw";
    fp.id = "fp";
    fc.id = "fireContainer";
    
    fw.className = "firework";
    fp.className = "fireworkParticle";

    img.src = "./particles.gif";
    
    fp.appendChild( img );
    
    ft.appendChild( fw );
    ft.appendChild( fp );
    
    document.body.appendChild( ft );
    document.body.appendChild( fc );
    firework_template = true;

    css = document.createElement( "link" );
    css.type = "text/css";
    css.rel = "stylesheet";
    css.href = "./fireworks.css";

    css.addEventListener( "load", function() {
      Popcorn.getScript( "./soundmanager2-nodebug-jsmin.js", function() {
        Popcorn.getScript( "./fireworks.js" );
      });
    });
    
    document.head.appendChild( css );
  }

  function isReady() {
    if ( !!window.createFirework && !!firework_template ) {
      return true;
    }
    return false;
  }

  Popcorn.plugin( "fireworks", {
    _setup: function() {
      !isReady() && load();
    },
    start: function( options ) {
      function run( opts ) {
        if ( !isReady() ) {
          setTimeout( run, 20 );
          return;
        }
        createFirework( opts.blastRadius,
                        opts.particles,
                        opts.circles,
                        opts.burstType,
                        opts.startX,
                        opts.startY,
                        opts.explodeX,
                        opts.explodeY,
                        !!opts.randomizeExplosionPattern,
                        !!opts.obeyWindowBoundaries || true
                      );
      }
      run( options );
    }
  });
})( Popcorn );
