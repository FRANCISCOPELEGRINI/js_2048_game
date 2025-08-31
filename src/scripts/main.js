import Game from '../modules/Game.class.js';
const game = new Game();

'use strict';

class Game {
    constructor(initialState) {
        this.size = 4;
        this.score = 0;
        this.status = 'start'; // start, playing, win, lose
        this._initialState = initialState ? this.cloneBoard(initialState) : null;
        this.board = initialState ? this.cloneBoard(initialState) : this.createEmptyBoard();
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
        return this.board.map(row => row.map(value => ({
            value,
            className: value ? `field-cell--${value}` : ''
        })));
    }

    getScore() {
        return this.score;
    }

    getStatus() {
        return this.status;
    }

    restart() {
        this.score = 0;
        this.status = this._initialState ? 'start' : 'playing';
        this.board = this._initialState ? this.cloneBoard(this._initialState) : this.createEmptyBoard();
        if (!this._initialState) {
            this.addRandomCell();
            this.addRandomCell();
        }
    }

    start() {
        if (this.status === 'start') {
            this.status = 'playing';
        }
    }

    moveLeft() {
        const { changed, points } = this.slideLeft();
        if (changed) {
            this.score += points;
            this.addRandomCell();
            this.checkGameOver();
        }
    }

    moveRight() {
        this.rotateBoard(180);
        this.moveLeft();
        this.rotateBoard(180);
    }

    moveUp() {
        this.rotateBoard(270);
        this.moveLeft();
        this.rotateBoard(90);
    }

    moveDown() {
        this.rotateBoard(90);
        this.moveLeft();
        this.rotateBoard(270);
    }

    slideLeft() {
        let changed = false;
        let points = 0;
        for (let i = 0; i < this.size; i++) {
            let row = this.board[i].filter(v => v !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    points += row[j];
                    row[j + 1] = 0;
                    if (row[j] === 2048) this.status = 'win';
                }
            }
            row = row.filter(v => v !== 0);
            while (row.length < this.size) row.push(0);
            if (!changed && row.some((v, idx) => v !== this.board[i][idx])) changed = true;
            this.board[i] = row;
        }
        return { changed, points };
    }

    rotateBoard(deg) {
        const N = this.size;
        let newBoard = this.createEmptyBoard();
        if (deg === 90) {
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    newBoard[j][N - 1 - i] = this.board[i][j];
                }
            }
        } else if (deg === 180) {
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    newBoard[N - 1 - i][N - 1 - j] = this.board[i][j];
                }
            }
        } else if (deg === 270) {
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    newBoard[N - 1 - j][i] = this.board[i][j];
                }
            }
        } else {
            return;
        }
        this.board = newBoard;
    }

    addRandomCell() {
        const empty = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) empty.push([i, j]);
            }
        }
        if (empty.length === 0) return;
        const [i, j] = empty[Math.floor(Math.random() * empty.length)];
        this.board[i][j] = Math.random() < 0.1 ? 4 : 2;
    }

    checkGameOver() {
        if (this.status === 'win') return;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const val = this.board[i][j];
                if (val === 0) return;
                if (i < this.size - 1 && val === this.board[i + 1][j]) return;
                if (j < this.size - 1 && val === this.board[i][j + 1]) return;
            }
        }
        this.status = 'lose';
    }
}

export default Game;
