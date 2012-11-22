// PLUGIN: pdf

(function ( Popcorn, document ) {

  /**
   * PDF popcorn plug-in
   * Loads and allows pages of a PDF file to be shown in a DIV.
   *
   * @param {Object} options
   *
   * Example:
   *  var p = Popcorn("#video")
   *     // Let the pdf plugin load your PDF file for you using pdfUrl.
   *     .pdf({
   *       start: 5, // seconds
   *       end: 15, // seconds
   *       pdfUrl: "url-of-pdf-file", // the PDF file to use (will be loaded)
   *       pdfPage: 6, // show page 6 of this PDF
   *       target: "pdf-container", // DIV in which to load gist
   *     })
   *     // Manage loading the PDF file yourself using pdfDoc.
   *     .pdf({
   *       start: 16, // seconds
   *       end: 20, // seconds
   *       pdfDoc: myPreviouslyLoadedPDFDoc, // PDFDoc object already created
   *       pdfPage: 7, // show page 6 of this PDF
   *       target: "pdf-container", // DIV in which to load gist
   *     })
   *     // Set your own width and height for the rendered page.
   *     .pdf({
   *       start: 21, // seconds
   *       end: 25, // seconds
   *       pdfDoc: myPreviouslyLoadedPDFDoc, // PDFDoc object already created
   *       pdfPage: 8, // show page 6 of this PDF
   *       width: 1024, // custom width to use instead of PDF's natural width
   *       height: 1024, // custom height to use instead of PDF's natural height
   *       target: "pdf-container", // DIV in which to load gist
   *     });
   */

   var CHECK_INTERVAL = 20;

  /**
   * Cached PDFDoc objects.
   */
  var _PDFJS,
      _docCache = {};

  /**
   * Helper function to load and cache a PDF document with callbacks
   */
  function loadPdf( options ) {

    var url = options.pdfUrl;

    function waitForPDFJS () {
      if ( _PDFJS ) {
        _PDFJS.getDocument( url ).then( function( pdfDoc ) {
          _docCache[ url ] = pdfDoc;
        });
      } else {
        setTimeout( waitForPDFJS, CHECK_INTERVAL );
      }
    }
    waitForPDFJS();
  }

  /**
   * Renders a single page of a PDF document. Defaults to using the
   * natural dimensions of the page, unless alternate width/height
   * are given.
   */
  function renderPage( options, page ) {
    var canvas = options.__canvas,
      ctx = canvas.getContext( "2d" ),
      scale = 1,
      viewport = page.getViewport( scale ),
      width = options.width || viewport.width;
      height = options.height || viewport.height;

    // TODO:
    // 14:33 < yury> humph: it's hard to define page width/height
    // 14:33 < yury> you can define scale=1
    // 14:34 < yury> and use canvas.transform to size it
    // 14:34 < yury> or do double viewport
    // 14:34 < yury> \canvas.scale()
    // 14:36 < yury> page can be rotated

    canvas.width = width;
    canvas.height = height;
    page.render({
      canvasContext: ctx,
      viewport: viewport
    });
    options.__rendered = true;
  }


  function drawPage( pdf, options ) {
    pdf.getPage( options.pageNumber ).then(function( page ) {
      renderPage( options, page );
    });
  }

  Popcorn.plugin( "pdf" , {

    manifest: {
      about: {
        name: "Popcorn PDF Plugin",
        version: "0.1",
        author: "@humphd",
        website: "http://vocamus.net/dave"
      },
      options: {
        start: {
          elem: "input",
          type: "text",
          label: "In"
        },
        end: {
          elem: "input",
          type: "text",
          label: "Out"
        },
        target: "pdf-container",
        width: {
          elem: "input",
          type: "text",
          label: "Width"
        },
        height: {
          elem: "input",
          type: "text",
          label: "Height"
        },
        pdfUrl: {
          elem: "input",
          type: "text",
          label: "PDF URL"
        },
        // TODO: Not sure how to deal with pdfDoc, which can only be done with script
        // pdfDoc     : ???
        pageNumber : {
          elem: "input",
          type: "text",
          label: "Page Number"
        }
      }
    },

    _setup: function( options ) {

      var container = document.getElementById(options.target),
          canvas = options.__canvas = document.createElement( "canvas" ),
          url = options.pdfUrl;

      options.width = options.width || 0;
      options.height = options.height || 0;

      canvas.style.display = "none";

      // TODO: need to cache/reuse canvas
      container.appendChild( canvas );

      if ( !window.PDFJS ) {
        Popcorn.getScript(
          "//mozilla.github.com/pdf.js/build/pdf.js",
          function() {
            if( !window.PDFJS ) {
              throw "Unable to load PDFJS";
            } else {
              _PDFJS = window.PDFJS;
              _PDFJS.disableWorker = true;
            }
          }
        );
      }
      if ( url && !_docCache[ url ] ) {
        loadPdf( options );
      }
    },


    /**
     * Expect one of pdfDoc or pdfUrl (must have one).  If we get
     * a pdfDoc object, it means the file has already been preloaded
     * and is ready to use (useful for larger PDF files).  Otherwise
     * we need to load it ourselves and manage it.
     */
    start: function( event, options ) {

      var doc;

      function tryToDraw() {
        doc = options.pdfDoc || _docCache[ options.pdfUrl ];
        if ( _PDFJS && doc ) {
          drawPage( doc, options );
        } else {
          setTimeout( tryToDraw, CHECK_INTERVAL );
        }
      }

      if ( !options.__rendered ) {
        tryToDraw();
      }

      options.__canvas.style.display = "inline-block";

    },


    end: function( event, options ){
      var canvas = options.__canvas;
      canvas.style.display = "none";
    },

    _teardown: function( options ) {
      var canvas = options.__canvas;
      canvas.parentNode.removeChild( canvas );
    }

  });

})( Popcorn, window.document );
