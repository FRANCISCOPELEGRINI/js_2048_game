// src/modules/Game.class.js
export default class Game {
  constructor(initialState) {
    this.size = 4;
    this.score = 0;
    this.status = 'start'; // start, playing, won, over
    this._initialState = initialState
      ? this.cloneBoard(initialState)
      : this.createEmptyBoard();
    this.board = this.cloneBoard(this._initialState);

    if (!initialState) {
      this.addRandomCell();
      this.addRandomCell();
    }
  }

  cloneBoard(board) {
    return board.map(row => [...row]);
  }

  createEmptyBoard() {
    return Array.from({ length: this.size }, () => Array(this.size).fill(0));
  }

  getState() {
    return this.board.map(row =>
      row.map(value => ({
        value,
        className: value ? 'field-cell--' + value : '',
      }))
    );
  }

  getScore() {
    return this.score;
  }

  getStatus() {
    return this.status;
  }

  restart() {
    this.score = 0;
    this.status = 'start';
    this.board = this.cloneBoard(this._initialState);
  }

  start() {
    if (this.status === 'start') {
      this.status = 'playing';
    }
  }

  moveLeft() {
    const oldBoard = this.cloneBoard(this.board);
    for (let i = 0; i < this.size; i++) {
      let row = this.board[i].filter(v => v !== 0);
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          this.score += row[j];
          row[j + 1] = 0;
        }
      }
      row = row.filter(v => v !== 0);
      while (row.length < this.size) row.push(0);
      this.board[i] = row;
    }
    this.afterMove(oldBoard);
  }

  moveRight() {
    this.board = this.board.map(row => row.reverse());
    this.moveLeft();
    this.board = this.board.map(row => row.reverse());
  }

  moveUp() {
    this.transpose();
    this.moveLeft();
    this.transpose();
  }

  moveDown() {
    this.transpose();
    this.moveRight();
    this.transpose();
  }

  transpose() {
    this.board = this.board[0].map((_, col) => this.board.map(row => row[col]));
  }

  afterMove(oldBoard) {
    if (!this.boardsEqual(oldBoard, this.board)) {
      this.addRandomCell();
    }
    if (this.checkWin()) {
      this.status = 'won';
    } else if (!this.canMove()) {
      this.status = 'over';
    } else {
      this.status = 'playing';
    }
  }

  boardsEqual(b1, b2) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (b1[i][j] !== b2[i][j]) return false;
      }
    }
    return true;
  }

  addRandomCell() {
    const empty = [];
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === 0) empty.push([i, j]);
      }
    }
    if (!empty.length) return;
    const [i, j] = empty[Math.floor(Math.random() * empty.length)];
    this.board[i][j] = Math.random() < 0.1 ? 4 : 2;
  }

  canMove() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.board[i][j] === 0) return true;
        if (i < this.size - 1 && this.board[i][j] === this.board[i + 1][j])
          return true;
        if (j < this.size - 1 && this.board[i][j] === this.board[i][j + 1])
          return true;
      }
    }
    return false;
  }

  checkWin() {
    return this.board.some(row => row.some(v => v === 2048));
  }
}
