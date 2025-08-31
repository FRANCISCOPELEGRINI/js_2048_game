'use strict';

class Game {
    constructor(initialState) {
        this.size = 4;
        this.score = 0;
        this.status = "playing"; // "playing", "won", "over"
        this.board = initialState || this.createEmptyBoard();
        this.addRandomCell();
        this.addRandomCell();
    }

    createEmptyBoard() {
        return Array.from({ length: this.size }, () => Array(this.size).fill(0));
    }

    getState() {
        return this.board.map(row => row.slice());
    }

    getScore() {
        return this.score;
    }

    getStatus() {
        return this.status;
    }

    restart() {
        this.score = 0;
        this.status = "playing";
        this.board = this.createEmptyBoard();
        this.addRandomCell();
        this.addRandomCell();
    }

    start() {
        this.restart();
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
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                newBoard[i][j] = this.board[j][i];
            }
        }
        this.board = newBoard;
    }

    move(transformFn, reverse = false) {
        let moved = false;

        for (let i = 0; i < this.size; i++) {
            let row = transformFn(this.board[i]);
            let { newRow, rowMoved, gainedScore } = this.mergeRow(row);
            if (reverse) newRow.reverse();
            if (rowMoved) moved = true;
            this.board[i] = newRow;
            this.score += gainedScore;
        }

        if (moved) this.addRandomCell();
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
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) empty.push([i, j]);
            }
        }
        if (empty.length === 0) return false;

        const [i, j] = empty[Math.floor(Math.random() * empty.length)];
        this.board[i][j] = Math.random() < 0.1 ? 4 : 2;
        return true;
    }

    checkGameStatus() {
        if (this.board.flat().includes(2048)) {
            this.status = "won";
            return;
        }
        if (!this.canMove()) {
            this.status = "over";
        }
    }

    canMove() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) return true;
                if (j < this.size - 1 && this.board[i][j] === this.board[i][j + 1]) return true;
                if (i < this.size - 1 && this.board[i][j] === this.board[i + 1][j]) return true;
            }
        }
        return false;
    }
}

export default Game;

