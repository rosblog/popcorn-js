(function( Popcorn ){
  var preloader = {},
      warn = ( console && console.warn ) ? console.warn : undefined,
      idHash = {},
      originalRemoveTrackEvent = Popcorn.removeTrackEvent,
      ref = Popcorn.removeTrackEvent.ref,

  // wraps around plugin function
  pluginPreloaderFn = function( name, options, preloadData ) {

    var loader,
        trackEventId,
        trackEvent,
        that = this,
        cueId,
        trackCueHash;

    if ( !name in this ) {
      warn && warn( "'" + name + "' does not name a plugin" );
      return this;
    }

    if ( !options ) {
      warn && warn( "options object is undefined" );
      return this;
    }

    this[ name ]( options );

    if ( !preloadData ) {
      warn && warn( "No preloadData argument!" );
      return this;
    }

    trackEventId = this.getLastTrackEventId();
    trackEvent = this.data.trackRefs[ trackEventId ];
    loader = trackEvent._natives.loader;

    if( !loader || typeof loader !== "function" ) {
      warn && warn( "'" + name + "' has no load function");
      return this;
    }

    trackCueHash = idHash[ trackEventId ] = [];

    Popcorn.forEach( preloadData, function( data ) {
      cueId = loader.call( that, trackEvent, data );
      trackCueHash.push( cueId );
    });

    return this;

  };

  // wrap removeTrackEvent so it can remove related cues for preloads
  Popcorn.removeTrackEvent = function( obj, removeId ) {
    var cueId,
        cueIdList;

    if ( removeId in idHash ) {
      cueIdList = idHash[ removeId ];
      while ( cueId = cueIdList.pop() ) {
        originalRemoveTrackEvent( obj, cueId );
      }
    }

    originalRemoveTrackEvent( obj, removeId );
  };

  // restore original ref function
  Popcorn.removeTrackEvent.ref = ref;

  preloader[ "pluginPreloader" ] = pluginPreloaderFn;

  // extend to popcorn
  Popcorn.extend( Popcorn.p, preloader );

})( Popcorn );