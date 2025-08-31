'use strict';

class Game {
  constructor(initialState) {
    this.size = 4;
    this.score = 0;
    this.status = 'start'; // start, playing, win, lose

    this._initialState = initialState ? this.cloneBoard(initialState) : this.createEmptyBoard();
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
        className: value ? 'field-cell--' + value : ''
      }))
    );
  }

  getScore() {
    return this.score;
  }

  getStatus() {
    return this.status;
  }

  start() {
    this.status = 'playing';
  }

  restart() {
    this.score = 0;
    this.status = 'start';
    this.board = this.cloneBoard(this._initialState);
  }

  moveLeft() {
    return this.move(row => row);
  }

  moveRight() {
    return this.move(row => row.slice().reverse(), true);
  }

  moveUp() {
    this.transpose();
    const moved = this.moveLeft();
    this.transpose();
    return moved;
  }

  moveDown() {
    this.transpose();
    const moved = this.moveRight();
    this.transpose();
    return moved;
  }

  transpose() {
    const newBoard = this.createEmptyBoard();
    for (let rowIndex = 0; rowIndex < this.size; rowIndex++) {
      for (let colIndex = 0; colIndex < this.size; colIndex++) {
        newBoard[rowIndex][colIndex] = this.board[colIndex][rowIndex];
      }
    }
    this.board = newBoard;
  }

  move(transformFn, reverse = false) {
    let moved = false;

    for (let rowIndex = 0; rowIndex < this.size; rowIndex++) {
      const row = transformFn(this.board[rowIndex]);
      const { newRow, rowMoved, gainedScore } = this.mergeRow(row);
      if (reverse) newRow.reverse();
      if (rowMoved) moved = true;
      this.board[rowIndex] = newRow;
      this.score += gainedScore;
    }

    if (moved) this.addRandomCell();
    if (this.status === 'start') this.status = 'playing';
    this.checkGameStatus();
    return moved;
  }

  mergeRow(row) {
    const newRow = row.filter(v => v !== 0);
    let gainedScore = 0;
    let rowMoved = false;

    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2;
        gainedScore += newRow[i];
        newRow[i + 1] = 0;
        i++;
      }
    }

    const finalRow = newRow.filter(v => v !== 0);
    while (finalRow.length < this.size) finalRow.push(0);
    if (finalRow.some((v, idx) => v !== row[idx])) rowMoved = true;

    return { newRow: finalRow, rowMoved, gainedScore };
  }

  addRandomCell() {
    const empty = [];
    for (let rowIndex = 0; rowIndex < this.size; rowIndex++) {
      for (let colIndex = 0; colIndex < this.size; colIndex++) {
        if (this.board[rowIndex][colIndex] === 0) empty.push([rowIndex, colIndex]);
      }
    }
    if (empty.length === 0) return false;

    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    this.board[r][c] = Math.random() < 0.1 ? 4 : 2;
    return true;
  }

  checkGameStatus() {
    if (this.board.flat().includes(2048)) {
      this.status = 'win';
      return;
    }
    if (!this.canMove()) {
      this.status = 'lose';
    }
  }

  canMove() {
    for (let rowIndex = 0; rowIndex < this.size; rowIndex++) {
      for (let colIndex = 0; colIndex < this.size; colIndex++) {
        if (this.board[rowIndex][colIndex] === 0) return true;
        if (colIndex < this.size - 1 && this.board[rowIndex][colIndex] === this.board[rowIndex][colIndex + 1]) return true;
        if (rowIndex < this.size - 1 && this.board[rowIndex][colIndex] === this.board[rowIndex + 1][colIndex]) return true;
      }
    }
    return false;
  }
}

export default Game;
