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

bp.loader = (function() {

  if (bp.debug) { console.log('bp loader starting'); }

  Modernizr.load([
    {
      load:[
        'js/vendor/crafty-min.js',
        'js/ball.js',
        'js/board.js'
      ],

      callback:function (url, result, key) {
        // TODO progress if needed
        ;
      },

      complete:function () {
        var totalPadding = bp.CANVAS_PADDING * 2,
            canvasWidth = bp.DEFAULT_GAME_BOARD_WIDTH + totalPadding,
            canvasHeight = bp.DEFAULT_GAME_BOARD_HEIGHT + totalPadding;

        if (bp.debug) { console.log('bp loader complete'); }
        // TODO play the game

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
            // When loading finished, play the main scene
            if (bp.debug) { console.log('Crafty loaded sprites, playing main scene')}
            Crafty.scene('main');
          });

          // TODO The loading scene is just a bit of text, do something interesting
          Crafty.e('2D, DOM, Text').attr({ w: 100, h: 20, x: 150, y: 120 })
            .text('Loading')
            .css({ 'text-align': 'center', 'color': '#000' });
        });

        // Automatically play the loading scene
        Crafty.scene('loading');

        // Main scene
        Crafty.scene("main", function () {
          //generateWorld();

          if (bp.debug) { console.log('Crafty main scene'); }
            Crafty.e('Board');
//          Crafty.e('2D, Canvas, BlueBubble')
//            .attr({w: 64, h: 64, x: 64, y: 64});
//          Crafty.e('2D, Canvas, YellowBubble')
//            .attr({w: 64, h: 64, x: 128, y: 64});
//          Crafty.e('2D, Canvas, RedBubble')
//            .attr({w: 64, h: 64, x: 192, y: 64});
//          Crafty.e('2D, Canvas, GreenBubble')
//            .attr({w: 64, h: 64, x: 256, y: 64});

        });
      }
    }
  ]);

})();

