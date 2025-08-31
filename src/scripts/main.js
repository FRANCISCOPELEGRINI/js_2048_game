'use strict';

function cloneBoard(board) {
  return board.map(row => [...row]);
}

export default class Game {
  constructor(initialState) {
    this.size = 4;
    this.score = 0;
    this.status = 'start'; // start, playing, win, lose
    this._initialState = initialState ? cloneBoard(initialState) : null;
    this.board = initialState ? cloneBoard(initialState) : this.createEmptyBoard();

    if (!initialState) {
      this.addRandomCell();
      this.addRandomCell();
    }
  }

  createEmptyBoard() {
    return Array.from({ length: this.size }, () => Array(this.size).fill(0));
  }

  start() {
    if (this.status === 'start') this.status = 'playing';
  }

  restart() {
    this.score = 0;
    this.status = 'start';
    this.board = this._initialState ? cloneBoard(this._initialState) : this.createEmptyBoard();
    if (!this._initialState) {
      this.addRandomCell();
      this.addRandomCell();
    }
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

  addRandomCell() {
    const emptyCells = [];
    for (let i = 0; i < this.size; i++)
      for (let j = 0; j < this.size; j++)
        if (!this.board[i][j]) emptyCells.push([i, j]);

    if (!emptyCells.length) return;

    const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.board[i][j] = Math.random() < 0.1 ? 4 : 2;
  }

  moveLeft() {
    return this.move(row => row);
  }

  moveRight() {
    return this.move(row => row.slice().reverse(), row => row.reverse());
  }

  moveUp() {
    return this.move(
      null,
      true
    );
  }

  moveDown() {
    return this.move(
      null,
      true,
      row => row.slice().reverse(),
      row => row.reverse()
    );
  }

  move(transform = row => row, transpose = false, preReverse = null, postReverse = null) {
    const oldBoard = cloneBoard(this.board);
    const size = this.size;

    const getCol = j => this.board.map(r => r[j]);
    const setCol = (j, col) => col.forEach((v, i) => (this.board[i][j] = v));

    for (let i = 0; i < size; i++) {
      let row = transpose ? getCol(i) : this.board[i];
      if (preReverse) row = preReverse(row);

      row = transform(row);

      let newRow = row.filter(v => v !== 0);
      for (let j = 0; j < newRow.length - 1; j++) {
        if (newRow[j] === newRow[j + 1]) {
          newRow[j] *= 2;
          this.score += newRow[j];
          newRow[j + 1] = 0;
          if (newRow[j] === 2048) this.status = 'win';
        }
      }
      newRow = newRow.filter(v => v !== 0);
      while (newRow.length < size) newRow.push(0);

      if (postReverse) newRow = postReverse(newRow);
      if (transpose) setCol(i, newRow);
      else this.board[i] = newRow;
    }

    const moved = JSON.stringify(oldBoard) !== JSON.stringify(this.board);
    if (moved) {
      if (this.status === 'playing' || this.status === 'start') this.status = 'playing';
      this.addRandomCell();
      if (!this.canMove()) this.status = 'lose';
    }

    return moved;
  }

  canMove() {
    for (let i = 0; i < this.size; i++)
      for (let j = 0; j < this.size; j++)
        if (!this.board[i][j]) return true;

    for (let i = 0; i < this.size; i++)
      for (let j = 0; j < this.size - 1; j++)
        if (this.board[i][j] === this.board[i][j + 1] || this.board[j][i] === this.board[j + 1][i])
          return true;

    return false;
  }
}
import Game from '../modules/Game.class.js';

const game = new Game();

const boardContainer = document.querySelector('.game-board');
const scoreContainer = document.querySelector('.score');
const statusMessage = document.querySelector('.status-message');
const startBtn = document.querySelector('.start-btn');

function renderBoard() {
  boardContainer.innerHTML = '';
  const state = game.getState();
  state.forEach(row => {
    row.forEach(cell => {
      const div = document.createElement('div');
      div.classList.add('field-cell');
      if (cell.className) div.classList.add(cell.className);
      div.textContent = cell.value || '';
      boardContainer.appendChild(div);
    });
  });
  scoreContainer.textContent = game.getScore();
  updateStatus();
}

function updateStatus() {
  const status = game.getStatus();
  if (status === 'start') {
    statusMessage.textContent = 'Press Start to play!';
    statusMessage.classList.remove('hidden');
    startBtn.textContent = 'Start';
  } else if (status === 'playing') {
    statusMessage.classList.add('hidden');
    startBtn.textContent = 'Restart';
  } else if (status === 'win') {
    statusMessage.textContent = 'You Win!';
    statusMessage.classList.remove('hidden');
  } else if (status === 'lose') {
    statusMessage.textContent = 'Game Over!';
    statusMessage.classList.remove('hidden');
  }
}

function handleMove(event) {
  let moved = false;
  switch (event.key) {
    case 'ArrowLeft':
      moved = game.moveLeft();
      break;
    case 'ArrowRight':
      moved = game.moveRight();
      break;
    case 'ArrowUp':
      moved = game.moveUp();
      break;
    case 'ArrowDown':
      moved = game.moveDown();
      break;
  }
  if (moved) renderBoard();
}

startBtn.addEventListener('click', () => {
  if (game.getStatus() === 'start') game.start();
  else game.restart();
  renderBoard();
});

document.addEventListener('keydown', handleMove);

renderBoard();
