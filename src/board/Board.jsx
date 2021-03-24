import React, { useState } from 'react';
import './Board.css';


class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null; //pointer
  }
}

class SingleLinkedList {
  constructor(value) { // you pass the first value on the linked list which is gona be the head and the tail
    const node = new LinkedListNode(value);
    this.head = node;
    this.tail = node;
  }
}

const BOARD_SIZE = 10;

const Board = () => {
  const [board, setBoard] = useState(createBoard(BOARD_SIZE));
  const [snakeCells, setSnakeCells] = useState(new Set([44])); // set will hold just nums that are snake body
  const [snake, setSnake] = useState(new SingleLinkedList(44)); // 44 is value that gets passed to the node cos every snake cell should know where it currently is

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cellValue, cellIndex) => (
            <div
              key={cellIndex}
              className={`cell ${
                snakeCells.has(cellValue) ? 'snake-cell' : ''}`}></div> //if snake cells have the cell value that we are at, then we also add the snake cell class making it green
           ))}
         </div>
      ))}
    </div>
  );
};

const createBoard = (BOARD_SIZE) => { // fills 2D arr with a counter so every cell has a unique num from 1 to n so we know what cell is a snake/food cell
  let counter = 1;
  const board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      currentRow.push(counter++);
    }
    board.push(currentRow);
  }
  return board;
};

export default Board;
//.fill() takes 3 arguments, first to last index you want to fill and third argument is with what you want to fill it

// new Array(BOARD_SIZE).fill(0).map((row) => newArray(BOARD_SIZE).fill(0)),
