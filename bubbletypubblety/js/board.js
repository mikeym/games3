/*
 * Bubbletypubblety game board representation.
 * Requires Crafty game engine, main.js and ball.js, JQuery and underscore.js.
 * Based on Starmelt's SameGame tutorial and example:
 * https://github.com/starmelt/craftyjstut/wiki/A-first-game
 * http://en.wikipedia.org/wiki/SameGame
 * Mikey Micheletti, for UW Gameplay program, Spring 2013
 */

'use strict'

var bp = bp || { };

// The bubbletypubblety game board.
Crafty.c('Board', {

  // Basic component initialization only, all the real work gets done in restartGame.
  init: function() {
    this.addComponent('2D, Canvas');
  },

  // Needed to invoke board functions from event handlers.
  getInstance: function() {
    return this;
  },

  // Sets and displays the updated score
  // If the optional overwrite argument is true, overwrites the score with value,
  // otherwise increments
  updateScore: function(value, overwrite) {
    if (overwrite) {
      bp.score = value;
    } else {
      bp.score += value;
    }
    $('#gameScore').text(bp.score);
  },

  // Setup the board's array of columns of game balls.
  // Note the board position (0,0) is in the left bottom, not at the canvas(0,0) coordinate
  // of the top left. If testingWin arg is true, sets up all red balls.
  setupBoard: function(testingWin) {
    var ballColors = bp.COLORS,
        x = this.x,
        y = this.y,
        ballW = bp.BallSize,
        ballH = bp.BallSize,
        rows = this.rows,
        cols = this.cols;

    // Create the board object as an array of columns each of which is an array of balls.

    // Create and return an array of columns
    this._board = _.range(cols).map(function(column) {
      // Create and return an array of rows within each column
      return _.range(rows).map(function(row) {
        var newBallX,
            newBallY,
            newBallColor;
        // Create and return a ball of a random color within each row
        newBallX = x + column * ballW;
        newBallY = y + (ballH * rows - (row + 1) * ballH);

        // Special case for testing win situation - all red balls...
        if (bp.debug && testingWin) {
          newBallColor = bp.COLOR_CODE_RED;
        } else {
          newBallColor = Crafty.math.randomElementOfArray(ballColors);
        }

        return Crafty.e('Ball').makeBall(newBallX,
                                         newBallY,
                                         newBallColor,
                                         _.bind(this.clickHandler, this)); // ball
      }, this); // row
      return column; // column
    }, this); // board
  },

  // Callback click handler passed to the game balls. Uses _translateToArrayPosition to
  // find out the column and row of the clicked game ball. Then marks any other similarly-colored
  // balls adjoining this one, gets rid of them, and repositions the remaining balls.
  clickHandler: function(obj) {
    var arrayPosition,
        colorCode,
        frame = Crafty.frame();

    if (!this._blockUntil || this._blockUntil < frame) {
      // Find the array position on the board of the ball we clicked.
      arrayPosition = this.translateToArrayPosition(obj.x, obj.y);

      // Get the color code directly from the ball at this position, obj won't have it
      colorCode = this._board[arrayPosition.x][arrayPosition.y].colorCode;

      // Fess up
      if (bp.debug) {console.log('_clickHandler x:' + obj.x + ', y:' + obj.y +
                                 ', arrayX:' + arrayPosition.x + ', arrayY:' + arrayPosition.y +
                                 ', colorCode:' + colorCode);}

      // Search for and flag all connected balls of the same color
      this.flagConnectedBalls(arrayPosition, colorCode);
      this.purgeColumns();
      this.moveBallsToNewPositions();

      // Test for remaining moves and end of game
      if (this.hasBeatTheBoard()) {
        this.elaborateWinDisplay();
      } else if (!this.hasAnyMovesLeft()) {
        this.snarkyStuckDisplay();
      }
    }
  },

  // TODO touch handler similar

  // Returns the Column x and Row y of the clicked game ball within the game board.
  // The x:0, y:0 game ball lives in the lower left corner.
  translateToArrayPosition: function(x, y) {
    return {
      x: Math.floor((x - (bp.BOARD_LEFT + bp.CanvasPadding)) / bp.BallSize),
      y: (bp.BoardRows - 1) -
          Math.floor((y - (bp.BOARD_TOP + bp.CanvasPadding)) / bp.BallSize)
    };
  },

  // Returns the x and y canvas coordinates for the ball being placed at the supplied
  // column and row position.
  translateToBallPosition: function(column, row) {
    return {
      x: bp.BOARD_LEFT + bp.CanvasPadding + (column * bp.BallSize),
      y: bp.BOARD_TOP + bp.CanvasPadding + (bp.BallSize * this.rows - (row + 1) * bp.BallSize)
    }
  },

  // Flags the supplied ball and all connected balls of the same color by adding a new
  // property '_flagged = true'. Expects the array position of the clicked ball and the
  // color code to hunt for. Tricky recursive inner function thingy does the work.
  flagConnectedBalls: function(arrayPosition, colorCode) {

    // Receives a list of balls to check. It will initially receive a list with just
    // one element, the ball that was clicked. The _flagged attribute marks connected
    // identically colored balls and avoids endless recursion.
    function flagInternal(arrayPositionList, board) {
      var head,
          tail,
          currentBall;

      if (_(arrayPositionList).isEmpty()) { return; }

      head = _(arrayPositionList).first();
      tail = _(arrayPositionList).rest();
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
    }
    flagInternal([arrayPosition], this._board);
  },

  // Returns true if all the balls are gone and the player has beat the board.
  hasBeatTheBoard: function() {
    var ballsLeft = 0;
    _.each(this._board, function(column, c) {
      _.each(column, function(ball, c) {
        ballsLeft += 1;
      });
    });
    return ballsLeft > 0 ? false : true;
  },

  // Returns true if the player has any moves left (any two balls of same color touching).
  // Undoubtedly there's a more economical way to do this, but this way works.
  hasAnyMovesLeft: function() {
    var that = this,
        col,
        row,
        brd = that._board,
        cols = bp.BoardCols,
        rows = bp.BoardRows,
        currentBall,
        currentBallColor,
        returnVal = false;

    for (col = 0; col < cols; col++) {
      for (row = 0; row < rows; row++) {
        if (brd[col] && brd[col][row]) {
          currentBall = brd[col][row];
          if (currentBall) {
            currentBallColor = currentBall.colorCode;
            if (brd[col][row - 1] && brd[col][row - 1].colorCode === currentBallColor) {
              returnVal = true;
              break;
            }
            if (brd[col][row + 1] && brd[col][row + 1].colorCode === currentBallColor) {
              returnVal = true;
              break;
            }
            if (brd[col - 1] && brd[col - 1][row] && brd[col - 1][row].colorCode === currentBallColor) {
              returnVal = true;
              break;
            }
            if (brd[col + 1] && brd[col + 1][row] && brd[col + 1][row].colorCode === currentBallColor) {
              returnVal = true;
              break;
            }
          }
        }
      }
      if (returnVal === true) { break; }
    }
    return returnVal;
  },

  // Copies all remaining unflagged balls from the current board to a new board, collapses
  // columns as it goes. When it finds a flagged ball, it destroys it.
  purgeColumns: function() {
    var newBoard = [ ],
        flaggedBalls = [ ];

    // Create a new array of the same-color balls adjacent to the one we clicked
    _.each(this._board, function(column, c) {
      _.each(column, function(ball, r) {
        if (ball._flagged) {
          flaggedBalls.push(ball);
        }
      });
    });

    // Set the score if at least two balls can be removed, otherwise unflag and return.
    if (flaggedBalls.length > 1) {
      this.updateScore(Math.pow(flaggedBalls.length - 1, 2));
    } else {
      _.each(flaggedBalls, function(ball) {
        ball._flagged = false;
      });
      return;
    }

    // At least two blocks can be removed. Loop again and delete them all. Create a new
    // _board using the remaining blocks, collapsing columns left when empty.
    _.each(this._board, function(column, c) {
      var newColumn = [ ];
      _.each(column, function(ball, r) {
        if (ball._flagged) {
          ball.destroy();
        } else {
          newColumn.push(ball);
        }
      });
      if (newColumn.length > 0) {
        newBoard.push(newColumn);
      }
    });

    // Replace the board with the remaining balls
    this._board = newBoard;
  },

  // Loops through all the balls, computes the position of the ball on the new board
  // and places it there.
  moveBallsToNewPositions: function() {
    var that = this,
        position,
        tweenFrames = bp.TWEEN_FRAMES;

    _.each(this._board, function(column, c) {
      _.each(column, function(ball, r) {
        position = that.translateToBallPosition(c, r);
        // ignore mouse clicks while we're tweening movement and animate the position change
        that._blockUntil = Crafty.frame() + tweenFrames;
        ball.tween({ x: position.x, y: position.y }, tweenFrames);
      });
    });
  },

  // Starts or restarts the game, setting geometry, ordering the board, initializing the score.
  restartGame: function() {

    // May be called from an event handler.
    var that = bp.board.getInstance();

    if (bp.debug) {
      console.log('//////////////////////////////');
      console.log('Starting or restarting game...');
      console.log('//////////////////////////////');
    }

    $('#stuck, #notbad').fadeOut(); // hide messages

    // When restarting, clear the board and win displays if any
    _.each(that._board, function(column, c) {
      _.each(column, function(ball, r) {
        ball.destroy();
      });
    });
    that._board = null; // game board

    _.each(that._display, function(ball2, b) {
      ball2.destroy();
    });
    that._display = null; // display board when game is done

    // Initialize board geometry, create the balls, initialize scoreboard
    bp.setGeometry();
    that.x = bp.BOARD_LEFT + bp.CanvasPadding;
    that.y = bp.BOARD_TOP + bp.CanvasPadding;
    that.cols = bp.BoardCols;
    that.rows = bp.BoardRows;
    that.w = bp.BallSize * that.cols;
    that.h = bp.BallSize * that.rows;
    that.setupBoard(false);
    that.updateScore(0, true);

    // Workaround for occasional stutter in firefox
    setTimeout(function() { that.moveBallsToNewPositions(); }, 750);
   },

  // Special debug function to set up an all-red board, called only from the console.
  debugAlmostWin: function() {
    var that = bp.board.getInstance();

    if (bp.debug) {
      console.log('//////////////////////////////');
      console.log('Cheaters Never Perspire...');
      console.log('//////////////////////////////');
    } else {
      return;
    }

    // When restarting, clear the board
    _.each(that._board, function(column, c) {
      _.each(column, function(ball, r) {
        ball.destroy();
      });
    });
    that._board = null;

    // Initialize board geometry, create all-red balls by passing 'true' to setupBoard
    bp.setGeometry();
    that.x = bp.BOARD_LEFT + bp.CanvasPadding;
    that.y = bp.BOARD_TOP + bp.CanvasPadding;
    that.cols = bp.BoardCols;
    that.rows = bp.BoardRows;
    that.w = bp.BallSize * that.cols;
    that.h = bp.BallSize * that.rows;
    that.setupBoard(true);
    that.updateScore(0, true);

    // Workaround for occasional stutter in firefox
    setTimeout(function() { that.moveBallsToNewPositions(); }, 750);
  },

  // Make an elaborate big whoopty-do when the player clears the board.
  elaborateWinDisplay: function() {
    // Array positions to spell the word 'WIN' in balls
    var winBalls = [
      [1.5,3],[2,4],[2.5,5],[3.5,4],[4.5,5],[5,4],[5.5,3], // 'W'
      [7,5],[7,4],[7,3], // 'I'
      [9,5],[9,4],[9,3],[10,3.75],[11,4.25],[12,3],[12,4],[12,5] // 'N'
      ];
    var bX, bY, bColor,
        ballW = bp.BallSize,
        ballH = bp.BallSize,
        ballColors = bp.COLORS,
        that = this;

    if (bp.debug) {console.log('Yer beat the board, dude.');}

    // Create an array of balls that spell the word 'WIN' that we can clean up later.
    that._display = [ ];
    _.each(winBalls, function(position, p) {
      bX = winBalls[p][0] * ballW;
      bY = winBalls[p][1] * ballH;
      bColor = Crafty.math.randomElementOfArray(ballColors);

      that._display.push(Crafty.e('Ball').makeBall(bX, bY, bColor, null));
    });

    $('#notbad').fadeIn();
  },

  // Poke fun at the player if they have balls on the board and no moves.
  snarkyStuckDisplay: function() {
    if (bp.debug) {console.log('Yer stuck, dude.');}
    $('#stuck').fadeIn();
  }

});

