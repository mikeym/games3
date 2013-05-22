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
// on one of the sprites. The four different ball colors all use this component.
Crafty.c("Ball", {

  // Initialization adds components, positions, and handlers
  init: function() {
    this.addComponent('2D, Canvas, Mouse, Tween');

    this.w = bp.BallSize;
    this.h = bp.BallSize;
    this.z = -1; // the board handles clicks and has a higher z-index than the balls
  },

  // Convenience method for creating new colored game balls. Called by the board.
  // Expects x and y coordinates, and a color code.
  makeBall: function(x, y, colorCode) {
    var randomX = Crafty.math.randomInt(0, bp.BoardWidth),
        randomY = Crafty.math.randomInt(0, bp.BoardHeight),
        tweenFrames = 35; // seems about right

    if (bp.debug) { console.log('makeBall x:' + x + ' y:' + y + ' colorCode:' + colorCode); }

    // Start at a random x y coordinate then tween movement to board position
    this.attr({x: randomX, y: randomY });
    this.tween({ x: x, y: y }, tweenFrames);
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