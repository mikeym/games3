/*
 * Bubbletypubblety game main loader and starter-upper script.
 * Requires Crafty.js and jQuery
 * Mikey Micheletti for UW Game Dev course
 */

'use strict';

// Main Bubbletypubblety (aka 'bp') object for constants and other shared bits
var bp = bp || { };

// Toggles logging
bp.debug = false;

// Default ball h and w dimension constants.
bp.DEFAULT_BALL_WIDTH = 64;
bp.DEFAULT_BALL_HEIGHT = 64;

// Default game board constants dimensions, rows and columns.
bp.DEFAULT_GAME_BOARD_WIDTH = 896;  // 14 columns of 64px balls
bp.DEFAULT_GAME_BOARD_HEIGHT = 576; // 9 rows of 64px balls
bp.DEFAULT_GAME_BOARD_ROWS = 9;
bp.DEFAULT_GAME_BOARD_COLS = 14;
bp.BOARD_LEFT = 0;
bp.BOARD_TOP = 0;
bp.CANVAS_PADDING = 4;

// Ball color codes used throughout the app
bp.COLOR_CODE_BLUE = 0;
bp.COLOR_CODE_GREEN = 1;
bp.COLOR_CODE_RED = 2;
bp.COLOR_CODE_YELLOW = 3;
bp.COLORS = [bp.COLOR_CODE_BLUE, bp.COLOR_CODE_GREEN, bp.COLOR_CODE_RED, bp.COLOR_CODE_YELLOW];
bp.COLOR_NAMES = ["Blue", "Green", "Red", "Yellow"];

// animation tweening constant // TODO adjust per device?
bp.TWEEN_FRAMES = 15;

// Dimensional and scoring values to be set dynamically
bp.Score = 0;
bp.YourHighScore = 0;
bp.BallSize = bp.DEFAULT_BALL_HEIGHT; // both height and width identical
bp.BoardWidth = bp.DEFAULT_GAME_BOARD_WIDTH;
bp.BoardHeight = bp.DEFAULT_GAME_BOARD_HEIGHT;
bp.BoardRows = bp.DEFAULT_GAME_BOARD_ROWS;
bp.BoardCols = bp.DEFAULT_GAME_BOARD_COLS;
bp.CanvasPadding = bp.CANVAS_PADDING;

bp.GameScale = 1.0; // default value
bp.BallSizeScaled = bp.BallSize;

// Modernizr loading and initialization
bp.loader = (function() {

  if (bp.debug) { console.log('bp loader starting'); }

  Modernizr.load([
    {
      load:[
        'js/vendor/underscore-min.js',
        'js/vendor/crafty-min.js',
        'js/ball.js',
        'js/board.js'
      ],

      callback:function (url, result, key) {
        // TODO progress if needed
      },

      complete:function () {
        bp.playTheGame();
      }
    }
  ]);

})();

// We set the canvas style width using media queries in main.css.
// Test for the reductions here, and set the same scale factor to
// use when testing a click event. This method is called during
// setup and whenever the window size changes.
bp.setGameScale = function() {
  var canvasStyleWidth = $('canvas').css('width'),
      scaleFactor = 1.0,
      ballSizeScaled = 64;

  if (canvasStyleWidth) {
    if (canvasStyleWidth === '812px') {
      scaleFactor = 0.9;
      ballSizeScaled = 58;
    } else if (canvasStyleWidth === '714px') {
      scaleFactor = 0.8;
      ballSizeScaled = 51;
    } else if (canvasStyleWidth === '627px') {
      scaleFactor = 0.7;
      ballSizeScaled = 45;
    } else if (canvasStyleWidth === '537px') {
      scaleFactor = 0.6;
      ballSizeScaled = 39;
    } else if (canvasStyleWidth === '448px') {
      scaleFactor = 0.5;
      ballSizeScaled = 32;
    } else if (canvasStyleWidth === '403px') {
      scaleFactor = 0.45;
      ballSizeScaled = 28.8;
    } else if (canvasStyleWidth === '358px') {
      scaleFactor = 0.40;
      ballSizeScaled = 26;
    } else if (canvasStyleWidth === '305px') {
      scaleFactor = 0.34;
      ballSizeScaled = 21.76;
    } else if (canvasStyleWidth === '269px') {
      scaleFactor = 0.3;
      ballSizeScaled = 19.2;
    }
  }
  bp.GameScale = scaleFactor;
  bp.BallSizeScaled = ballSizeScaled;
  if (true) {console.log('canvas width: ' + canvasStyleWidth + ', scale: ' + bp.GameScale); }
};

bp.playTheGame = function() {
  var totalPadding,
      canvasWidth,
      canvasHeight;

  if (bp.debug) { console.log('Loading complete, playing game.'); }

  // Set initial game geometry and load resources
  totalPadding = bp.CanvasPadding * 2;
  canvasWidth = bp.BoardWidth + totalPadding;
  canvasHeight = bp.BoardHeight + totalPadding;

  // Creates a div with the id 'cr-stage' if there isn't one already
  Crafty.mobile = false; // stop Crafty doing crufty mobile strangeness when called before init
  Crafty.init(canvasWidth, canvasHeight);
  Crafty.canvas.init();

  // The canvas is absolutely positioned by Crafty, but in the wrong place.
  // Overwriting positioning here, couldn't figure how to do it otherwise.
  Crafty.canvas._canvas.style.top = '6px';
  Crafty.canvas._canvas.style.left = '8px';
  if (bp.debug) { console.log('Crafty canvas init: ' + canvasWidth + ', ' + canvasHeight); }

  // Test for window size changes, will be used when setting click targets
  bp.setGameScale();
  Crafty.addEvent(this, window, "resize", bp.setGameScale);

  // let Crafty know about our bubble sprites, we currently only have 64x64 balls
  Crafty.sprite(64, 'img/bubblesprites64.png', {
    BlueBubble: [bp.COLOR_CODE_BLUE, 0],
    GreenBubble: [bp.COLOR_CODE_GREEN, 0],
    RedBubble: [bp.COLOR_CODE_RED, 0],
    YellowBubble: [bp.COLOR_CODE_YELLOW, 0]
  });

  // When starting, load sprites and other assets
  Crafty.scene('loading', function() {
    if (bp.debug) { console.log('Crafty loading scene'); }
    Crafty.load(['img/bubblesprites64.png'], function() {

      // Add loading visuals if need be...

      // When loading finished, play the main scene
      if (bp.debug) { console.log('Crafty loaded sprites, playing main scene'); }
      Crafty.scene('main');
    });

  });

  // Automatically play the loading scene
  Crafty.scene('loading');

  // Main scene simply restarts the game.
  Crafty.scene("main", function () {
    if (bp.debug) { console.log('Crafty main scene'); }

    // Create the board and hook up the new game links
    bp.board = Crafty.e('Board');

    // Hide the info panel when you start a new game
    $('#newGameLink, #newGameLink2, #newGameLink3').on('click', function() {
      $('#infoContent').slideUp('slow');
      $('#caretArrow').removeClass('icon-caret-up').addClass('icon-caret-down');
      bp.board.restartGame();
    });

    // Info panel link animation
    $('#infoLink').click(function() {
      $('#infoContent').slideToggle('slow', 'linear');
      $('#caretArrow').toggleClass('icon-caret-up', 'icon-caret-down');
      return false;
    });

    // Let's have some fun...
    bp.board.restartGame();
  });

}

