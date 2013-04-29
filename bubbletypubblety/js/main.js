/*
 * Bubbletypubblety game main loader and starter-upper script.
 * Requires crafty.js
 * Mikey Micheletti for UW Game Dev course
 */

'use strict';

// Main Bubbletypubblety (aka 'bp') object for constants and other shared bits
var bp = bp || { };

// Toggles logging
bp.debug = true;

// Default ball h and w dimensions. TODO adjust actual dimensions responsively
bp.DEFAULT_BALL_WIDTH = 64;
bp.DEFAULT_BALL_HEIGHT = 64;

// Default game board dimensions, rows and columns. // TODO adjust responsively
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

// animation tweening
bp.TWEEN_FRAMES = 15;

// scoring
bp.Score = 0;
bp.YourHighScore = 0;

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
        ;
      },

      complete:function () {
        bp.playTheGame();
      }
    }
  ]);

})();

bp.playTheGame = function() {
  var totalPadding = bp.CANVAS_PADDING * 2,
    canvasWidth = bp.DEFAULT_GAME_BOARD_WIDTH + totalPadding,
    canvasHeight = bp.DEFAULT_GAME_BOARD_HEIGHT + totalPadding;

  if (bp.debug) { console.log('Loading complete, playing game.'); }

  // Creates a div with the id 'cr-stage' if there isn't one already
  Crafty.init(canvasWidth, canvasHeight);
  Crafty.canvas.init();

  // The canvas is absolutely positioned by Crafty, but in the wrong place.
  // Overwriting positioning here, couldn't figure how to do it otherwise.
  // Might need to adjust once in responsive-ville.
  Crafty.canvas._canvas.style.top = '6px';
  Crafty.canvas._canvas.style.left = '8px';
  if (bp.debug) { console.log('Crafty canvas init: ' + canvasWidth + ', ' + canvasHeight); }

  // let Crafty know about our bubble sprites. TODO pops. TODO responsive sizes?
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
      if (bp.debug) { console.log('Crafty loaded sprites, playing main scene')}
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
    $('#newGameLink, #newGameLink2, #newGameLink3').on('click', bp.board.restartGame);

    // Let's have some fun...
    bp.board.restartGame();
  });

}

