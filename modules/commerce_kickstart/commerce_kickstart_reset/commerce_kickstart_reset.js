/**
 */
(function ($) {

if(window.__noconflict){ jQuery.noConflict();}
  Drupal.behaviors.demoActiveBar = {
    attach: function ( context, settings ) {
      $('body:not(.overlay)').once('demo', function() {
        $('<div></div>').html(settings.demo.message)
          .activebar(settings.demo);
      });
    }
  }

  $.fn.activebar = function( options ) {
    // Merge the specified options with the default ones
    options = $.fn.extend( {}, $.fn.activebar.defaults, options );

    if ( $.fn.activebar.container === null ) {
      $.fn.activebar.container = initializeActivebar( options );
    }

    // If the activebar is currently visible hide it
    $.fn.activebar.hide();

    // Remove all elements from the activebar content, which might be there
    $( '.content', $.fn.activebar.container ).empty();

    // Use all provided elements as new content source
    $(this).each( function() {
      $( '.content', $.fn.activebar.container ).append( this );
    });

    // Update the position based on the new content data height
    $.fn.activebar.container.css('bottom', '-' + $.fn.activebar.container.height() + 'px' );

    // Show the activebar
    if(options.preload){
      var load = {a:0, b:0}

      function preloadInit(){
        if(load.a && load.b){
          $.fn.activebar.show();
        }
      }

      $('<img src="'+options.icons_path+'question.png" class="normal">').load(function(){load.a=1; preloadInit()});
      $('<img src="'+options.icons_path+'tipsy-arrow-s.png" class="normal">').load(function(){load.b=1; preloadInit()});

    }else{
      $.fn.activebar.show();
    }

    // Tipsy
    var help = $('#activebar-container .help-section');

    $('.tipsy-link', help).attr('title', ($('.child', help).html()));
    $('.tipsy-link', help).tipsy({
      trigger:'manual',
      gravity:'s',
      html:true,
      opacity: 1.0,
      offset: 45
    });

    var timer;
    var hideTipsy = function () {
      $('.tipsy-link', help).tipsy('hide');
    };

    $('.tipsy').live('mouseover', function (e) {
      clearTimeout(timer);
    });

    $('.tipsy').live('mouseout', function (e) {
      timer = setTimeout(hideTipsy, 100);
    });

    $('.tipsy-link', help).bind('mouseover', function (e) {
      $(this).tipsy('show');
    });

    $('.tipsy-link', help).bind('mouseout', function (e) {
      timer = setTimeout(hideTipsy, 500);
    });
  };

  /**
  * Default options used if nothing more specific is provided.
  */
  $.fn.activebar.defaults = {
    'background': '#1492cd',
    'font': 'Bitstream Vera Sans,verdana,sans-serif',
    'fontColor': 'White',
    'fontSize': '11px',
    'icons_path' : 'images/',
    'preload': true
  };

  /**
  * Indicator in which state the activebar currently is
  * 0: Moved in (hidden)
  * 1: Moving in (hiding)
  * 2: Moving out (showing)
  * 3: Moved out (shown)
  */
  $.fn.activebar.state = 0;

  /**
  * Activebar container object which holds the shown content
  */
  $.fn.activebar.container = null;

  /**
  * Show the activebar by moving it in
  */
  $.fn.activebar.show = function() {
    if ( $.fn.activebar.state > 1 ) {
      // Already moving out or visible. Do Nothing.
      return;
    }

    $.fn.activebar.container.css({ 'display': 'block', 'bottom': '0' });
    $.fn.activebar.state = 3;
  };

  /**
  * Hide the activebar by moving it out
  */
  $.fn.activebar.hide = function() {
    if ( $.fn.activebar.state < 2 ) {
      // Already moving in or hidden. Do nothing.
      return;
    }

    $.fn.activebar.state = 1;

    var height   = $.fn.activebar.container.height();
    $.fn.activebar.container.animate({'bottom': '-=' + height + 'px'}, height * 20, 'linear', function() {
      $.fn.activebar.container.css( 'display', 'none' );
      $.fn.activebar.visible = false;
    });
  };

  /****************************************************************
  * Private function only accessible from within this plugin
  ****************************************************************/

  /**
  * Create the a basic activebar container object and return it
  */
    function initializeActivebar( options ) {
    // Create the container object
    var container = $( '<div></div>' ).attr( 'id', 'activebar-container' );

    // Set the needed css styles
    container.css({
      'display': 'none',
      'position': 'fixed',
      'zIndex': '9999',
      'bottom': '0px',
      'left': '0px',
      'cursor': 'default',
      'padding': '4px',
      'font-size' : '9px',
      'height': '30px',
      'background': options.background,
      'color': options.fontColor
    });

    // Make sure the bar has always the correct width
    $(window).bind( 'resize', function() {
      container.width( $(this).width() );
    });

    // Set the initial bar width
    $(window).trigger( 'resize' );

    // The IE prior to version 7.0 does not support position fixed. However
    // the correct behaviour can be emulated using a hook to the scroll
    // event. This is a little choppy, but it works.
    if ( $.browser.msie && ( $.browser.version.substring( 0, 1 ) == '5' || $.browser.version.substring( 0, 1 ) == '6' ) ) {
      // Position needs to be changed to absolute, because IEs fallback
      // for fixed is static, which is quite useless here.
      container.css( 'position', 'absolute' );
      $( window ).scroll(
        function() {
          container.stop( true, true );
          if ( $.fn.activebar.state == 3 ) {
            // Activebar is visible
            container.css( 'bottom', $( window ).scrollTop() + 'px' );
          }
          else {
            // Activebar is hidden
            container.css( 'bottom', ( $( window ).scrollTop() + container.height() ) + 'px' );
          }
        }
      ).resize(function(){$(window).scroll();});
    }


    // Create the initial content container
    container.append(
      $( '<div></div>' ).attr( 'class', 'content' )
        .css({
          'margin': '8px 8px 8px 10%',
          'text-transform': 'uppercase',
          'float': 'left'
        })
    );

    // Add the icon container
    container.append(
      $( '<div></div>' ).attr( 'class', 'icon' )
        .css({
          'float': 'left',
          'width': '15px',
          'height': '15px',
          'margin': '8px 0'
        })
        .append('<div><div class="help-section">' +
        '<a href="#" class="tipsy-link" title=""><img src="' + options.icons_path + 'question.png" class="normal"/></a>' +
        '<div class="child">' +
          options.tooltip +
        '</div></div></div>')
    );

    // Add the icon container
    var killbutton = $( '<span>' + options.kill.message + '</span>' ).attr( 'class', 'kill' )
      .css({
        'float': 'right',
        'margin': '3px 10% 3px 0',
        'padding': '3px 10px',
        'color': '#8a8a8a',
        'background-color': '#efebec',
        'fontFamily': options.font,
        'fontSize': options.fontSize,
        'border': '1px solid rgba(0, 0, 0, 0.1)',
        'text-align': 'center',
        '-webkit-border-radius': '4px',
        '-moz-border-radius': '4px',
        'border-radius': '4px'
      })
      .click(function(event) {
        window.location.href = options.kill.url;
        event.stopPropagation();
      });
    setOptionsOnContainer( killbutton );
    container.append( killbutton );

    // Add the close button
    var closeButton = $( '<span>' + options.disable.message + '</span>' ).attr( 'class', 'close' )
      .css({
        'float': 'right',
        'margin': '3px 10px 3px 0',
        'padding': '3px 10px',
        'color': '#8a8a8a',
        'background-color': '#efebec',
        'fontFamily': options.font,
        'fontSize': options.fontSize,
        'border': '1px solid rgba(0, 0, 0, 0.1)',
        'text-align': 'center',
        '-webkit-border-radius': '4px',
        '-moz-border-radius': '4px',
        'border-radius': '4px'
      })
      .click(function(event) {
        $.fn.activebar.hide();
        $.get(options.disable.url);
        event.stopPropagation();
      });
    setOptionsOnContainer( closeButton );
    container.append( closeButton );

    $('.hover', container).hide();
    $('body').prepend( container );

    return container;
  };

  /**
  * Set the provided options on the given activebar container object
  */
  function setOptionsOnContainer( container, options ) {
    // Register functions to change between normal and highlight background
    // color on mouseover
    container.unbind( 'mouseenter mouseleave' );
    container.hover(
    function() {
      $(this).css({backgroundColor: '#909697', color: "#474747", cursor: 'pointer'}).addClass('hover');
      $('.hover', container).show();
      $('.normal', container).hide();
    },
    function() {
      $(this).css( {'backgroundColor': '#efebec', color: "#8a8a8a", cursor: 'default'} ).removeClass('hover');
      $('.hover', container).hide();
      $('.normal', container).show();
    }
    );
  }

})(jQuery);