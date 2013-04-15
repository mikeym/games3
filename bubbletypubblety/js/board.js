/*
 * Bubbletypubblety game board representation.
 * Requires Crafty game engine, main.js and ball.js.
 * Based on Starmelt's SameGame tutorial and example:
 * https://github.com/starmelt/craftyjstut/wiki/A-first-game
 * http://en.wikipedia.org/wiki/SameGame
 * Mikey Micheletti, for UW Gameplay program, Spring 2013
 */

'use strict'

var bp = bp || { };

// The bubbletypubblety game board.
Crafty.c('Board', {

  // Creates the board and sets it up
  init: function() {
    this.addComponent('2D, Canvas');
    this.x = bp.BOARD_LEFT + bp.CANVAS_PADDING;
    this.y = bp.BOARD_TOP + bp.CANVAS_PADDING;
    // TODO responsive dimensions
    this.cols = bp.DEFAULT_GAME_BOARD_COLS;
    this.rows = bp.DEFAULT_GAME_BOARD_ROWS
    this.w = bp.DEFAULT_BALL_WIDTH * this.cols;
    this.h = bp.DEFAULT_BALL_HEIGHT * this.rows;
    this._setupBoard();
  },

  // Setup the board's array of columns of game balls, called from init only.
  // Note the board position (0,0) is in the left bottom, not at the canvas(0,0) coordinate
  // of the top left
  _setupBoard: function() {
    var column,
        row,
        that,
        ballColors = bp.COLORS,
        newBall,
        newBallColor,
        x = this.x,
        y = this.y,
        ballW = bp.DEFAULT_BALL_WIDTH,
        ballH = bp.DEFAULT_BALL_HEIGHT,
        rows = this.rows,
        cols = this.cols;
    this._board = [ ];
    for (column = 0; column < cols; column++) {
      this._board[column] = [ ];
      for (row = 0; row < rows; row++) {
        // Here, 'this' is the execution context of the function.
        // Makes sure that 'this' is in the context of a board entity, so that
        // we can translate a click location to an array x/y.
        that = this;
        newBallColor = Crafty.math.randomElementOfArray(ballColors);
        newBall = Crafty.e('Ball')
                          .makeBall(x + column * ballW,
                                    y + (ballH * rows - (row + 1) * ballH),
                                    newBallColor,
                                    function() {
                                      // bind click handler to this ball
                                      that._clickHandler.apply(that, arguments);
                                    });
        this._board[column][row] = newBall;
      }
    }
  },

  // Callback click handler passed to the game balls. Uses _translateToArrayPosition to
  // find out the column and row of the clicked game ball. Then marks any other similarly-colored
  // balls adjoining this one, gets rid of them, and repositions the remaining balls.
  _clickHandler: function(obj) {
    var arrayPosition,
        colorCode;

    // Find the array position on the board of the ball we clicked.
    arrayPosition = this._translateToArrayPosition(obj.x, obj.y);

    // Get the color code directly from the ball at this position, obj won't have it
    colorCode = this._board[arrayPosition.x][arrayPosition.y].colorCode;

    // Fess up
    if (bp.debug) {console.log('_clickHandler x:' + obj.x + ', y:' + obj.y +
                               ', arrayX:' + arrayPosition.x + ', arrayY:' + arrayPosition.y +
                               ', colorCode:' + colorCode);}

    // Search for and flag all connected balls of the same color
    this._flagConnectedBalls(arrayPosition, colorCode);
    this._purgeColumns();
    this._moveBallsToNewPositions();
  },

  // TODO touch handler similar

  // Returns the Column x and Row y of the clicked game ball within the game board.
  // The x:0, y:0 game ball lives in the lower left corner.
  _translateToArrayPosition: function(x, y) {
    return {
      x: Math.floor((x - (bp.BOARD_LEFT + bp.CANVAS_PADDING)) / bp.DEFAULT_BALL_WIDTH),
      y: (bp.DEFAULT_GAME_BOARD_ROWS - 1) -
          Math.floor((y - (bp.BOARD_TOP + bp.CANVAS_PADDING)) / bp.DEFAULT_BALL_HEIGHT)
    };
  },

  // Returns the x and y canvas coordinates for the ball being placed at the supplied
  // column and row position.
  _translateToBallPosition: function(column, row) {
    return {
      x: bp.BOARD_LEFT + (column * bp.DEFAULT_BALL_WIDTH),
      y: bp.BOARD_TOP + (bp.DEFAULT_BALL_HEIGHT * this.rows - (row + 1) * bp.DEFAULT_BALL_HEIGHT)
    }
  },

  // Flags the supplied ball and all connected balls of the same color by adding a new
  // property '_flagged = true'. Expects the array position of the clicked ball and the
  // color code to hunt for. Tricky recursive inner function thingy does the work.
  _flagConnectedBalls: function(arrayPosition, colorCode) {

    // Receives a list of functions to check. It will initially receive a list with just
    // one element, the ball that was clicked. The _flagged attribute marks connected
    // identically colored balls and avoids endless recursion.
    function flagInternal(arrayPositionList, board) {
      var head,
          tail,
          currentBall;
      if (arrayPositionList.length === 0) {
        return;
      }
      head = arrayPositionList[0];
      tail = arrayPositionList.slice(1);
      if (board[head.x]) {
        currentBall = board[head.x][head.y];
        if (currentBall && !currentBall._flagged && currentBall.colorCode === colorCode) {
          currentBall._flagged = true;
          tail.push({ x: head.x, y: head.y - 1 });
          tail.push({ x: head.x, y: head.y + 1 });
          tail.push({ x: head.x - 1, y: head.y });
          tail.push({ x: head.x + 1, y: head.y });

          if (bp.debug) {console.log('flagged: x:' + head.x + ', y:' + head.y + ', color:' + colorCode); }
        }
      }
      flagInternal(tail, board);
    };
    flagInternal([arrayPosition], this._board);
  },

  // Copies all remaining unflagged balls from the current board to a new board, collapses
  // columns as it goes. When it finds a flagged ball, it destroys it.
  _purgeColumns: function() {
    var newBoard = [ ],
        column,
        currentColumn,
        newColumn,
        row,
        ball;
    for (column = 0; column < this._board.length; column++) {
      currentColumn = this._board[column];
      newColumn = [ ];

      for (row = 0; row < currentColumn.length; row++) {
        ball = currentColumn[row];
        if (ball._flagged) {
          ball.destroy();
        } else {
          newColumn.push(ball);
        }
      }

      if (newColumn.length > 0) {
        newBoard.push(newColumn);
      }
    }
    this._board = newBoard;
  },

  // Loops through all the balls, computes the position of the ball on the new board
  // and places it there.
  _moveBallsToNewPositions: function() {
    var column,
        currentColumn,
        row,
        ball,
        position;
    for (column = 0; column < this._board.length; column++) {
      currentColumn = this._board[column];
      for (row = 0; row < currentColumn.length; row++) {
        ball = currentColumn[row];
        position = this._translateToBallPosition(column, row);
        ball.x = position.x;
        ball.y = position.y;
      }
    }
  }

});
