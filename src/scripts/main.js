export class Game {
  constructor(initialState) {
    this.initialState = initialState;
    this.board = initialState ? this.cloneBoard(initialState) : this.getEmptyBoard();
    this.score = 0;
    this.status = 'playing';

    if (!initialState) {
      this.addRandomTile();
      this.addRandomTile();
    }
  }

  getEmptyBoard() {
    return Array(4).fill(null).map(() => Array(4).fill(0));
  }

  cloneBoard(board) {
    return board.map(row => [...row]);
  }

  getState() {
    return this.board;
  }

  getScore() {
    return this.score;
  }

  getStatus() {
    return this.status;
  }

  start() {
    if (this.status === 'playing') {
      return;
    }
    this.restart();
  }

  restart() {
    this.board = this.initialState ? this.cloneBoard(this.initialState) : this.getEmptyBoard();
    this.score = 0;
    this.status = 'playing';
    if (!this.initialState) {
      this.addRandomTile();
      this.addRandomTile();
    }
  }

  addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  moveLeft() {
    const originalBoard = this.cloneBoard(this.board);
    let moved = false;

    for (let r = 0; r < 4; r++) {
      let row = this.board[r].filter(cell => cell !== 0);
      let mergedRow = [];
      let i = 0;

      while (i < row.length) {
        if (i + 1 < row.length && row[i] === row[i + 1]) {
          const mergedValue = row[i] * 2;
          mergedRow.push(mergedValue);
          this.score += mergedValue;
          i += 2;
        } else {
          mergedRow.push(row[i]);
          i++;
        }
      }

      while (mergedRow.length < 4) {
        mergedRow.push(0);
      }

      this.board[r] = mergedRow;
    }

    moved = this.boardsAreDifferent(originalBoard, this.board);
    if (moved) {
      this.addRandomTile();
      this.checkGameStatus();
    }
  }

  moveRight() {
    const originalBoard = this.cloneBoard(this.board);
    this.board = this.board.map(row => this.moveRowRight(row));
    const moved = this.boardsAreDifferent(originalBoard, this.board);
    if (moved) {
      this.addRandomTile();
      this.checkGameStatus();
    }
  }

  moveUp() {
    const originalBoard = this.cloneBoard(this.board);
    this.board = this.transposeBoard(this.board);
    this.moveLeft();
    this.board = this.transposeBoard(this.board);
    const moved = this.boardsAreDifferent(originalBoard, this.board);
    if (moved) {
      this.checkGameStatus();
    }
  }

  moveDown() {
    const originalBoard = this.cloneBoard(this.board);
    this.board = this.transposeBoard(this.board);
    this.moveRight();
    this.board = this.transposeBoard(this.board);
    const moved = this.boardsAreDifferent(originalBoard, this.board);
    if (moved) {
      this.checkGameStatus();
    }
  }

  // Métodos Auxiliares
  moveRowRight(row) {
    let newRow = row.filter(cell => cell !== 0).reverse();
    let mergedRow = [];
    let i = 0;
    while (i < newRow.length) {
      if (i + 1 < newRow.length && newRow[i] === newRow[i + 1]) {
        const mergedValue = newRow[i] * 2;
        mergedRow.push(mergedValue);
        this.score += mergedValue;
        i += 2;
      } else {
        mergedRow.push(newRow[i]);
        i++;
      }
    }
    while (mergedRow.length < 4) {
      mergedRow.push(0);
    }
    return mergedRow.reverse();
  }

  transposeBoard(board) {
    return board[0].map((_, colIndex) => board.map(row => row[colIndex]));
  }

  boardsAreDifferent(board1, board2) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board1[r][c] !== board2[r][c]) {
          return true;
        }
      }
    }
    return false;
  }

  isGameOver() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) return false;
        if (c < 3 && this.board[r][c] === this.board[r][c + 1]) return false;
        if (r < 3 && this.board[r][c] === this.board[r + 1][c]) return false;
      }
    }
    return true;
  }

  checkGameStatus() {
    let hasWon = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 2048) {
          hasWon = true;
          break;
        }
      }
      if (hasWon) break;
    }

    if (hasWon) {
      this.status = 'win';
    } else if (this.isGameOver()) {
      this.status = 'game-over';
    } else {
      this.status = 'playing';
    }
  }
}