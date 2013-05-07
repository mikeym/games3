/*
 * Bubbletypubblety game piece (ball) representation.
 * Requires Crafty game engine and main.js for constants and sprite loading.
 * Based on Starmelt's SameGame tutorial and example:
 * https://github.com/starmelt/craftyjstut/wiki/A-first-game
 * http://en.wikipedia.org/wiki/SameGame
 * Mikey Micheletti, for UW Gameplay program, Spring 2013
 */

'use strict';

var bp = bp || { };

// The Ball component defines a 2D canvas-based single colored ball based
// on one of the sprites, and binds mouse click and touch events. The four
// different ball colors all use this component.
Crafty.c("Ball", {

  // Initialization adds components, positions, and handlers
  init: function() {
    this.addComponent('2D, Canvas, Mouse, Tween');

    // TODO set this dynamically as screen dimensions change
    this.w = bp.DEFAULT_BALL_WIDTH;
    this.h = bp.DEFAULT_BALL_HEIGHT;
    this.z = 10;

    // From the example TODO Grok
    this.bind('Click', function(obj) {
      if (this._onClickCallback) {
        this._onClickCallback({
          x: obj.realX,
          y: obj.realY
        });
      }
    });

    // TODO touch
  },

  // Convenience method for creating new colored game balls. Called by the board.
  // Expects x and y coordinates, a color code, and a click handler function.
  makeBall: function(x, y, colorCode, onClickCallback) {
    var randomX = Crafty.math.randomInt(0, bp.DEFAULT_GAME_BOARD_WIDTH),
        randomY = Crafty.math.randomInt(0, bp.DEFAULT_GAME_BOARD_HEIGHT),
        tweenFrames = 35; // seems about right

    if (bp.debug) { console.log('makeBall x:' + x + ' y:' + y + ' colorCode:' + colorCode); }

    // Start at a random x y coordinate then tween movement to board position
    this.attr({x: randomX, y: randomY });
    this.tween({ x: x, y: y }, tweenFrames);
    this._onClickCallback = onClickCallback;
    this.colorCode = colorCode;

    switch (colorCode) {
      case bp.COLOR_CODE_BLUE:
        this.addComponent('BlueBubble');
        break;
      case bp.COLOR_CODE_GREEN:
        this.addComponent('GreenBubble');
        break;
      case bp.COLOR_CODE_RED:
        this.addComponent('RedBubble');
        break;
      case bp.COLOR_CODE_YELLOW:
        this.addComponent('YellowBubble');
        break;
    }

    return this;
  }
});