import React, { useState, useEffect } from 'react';
import {
  randomIntFromInterval,
  reverseLinkedList,
  useInterval
} from '../utils.js';
import './Board.css';


class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null; //pointer
  }
}

class LinkedList {
  constructor(value) { // you pass the first value on the linked list which is gona be the head and the tail
    const node = new LinkedListNode(value);
    this.head = node;
    this.tail = node;
  }
}

const Direction = {
  "UP": "UP",
  "RIGHT": "RIGHT",
  "DOWN": "DOWN",
  "LEFT": "LEFT",
}

const BOARD_SIZE = 15;
const PROBABILITY_OF_DIRECTION_REVERSAL_FOOD = 0.3;

const getStartingSnakeValue = (board) => {
  const rowSize = board.length;
  const colSize = board[0].length;
  const startingRow = Math.round(rowSize/3);
  const startingCol = Math.round(colSize/3);
  const startingCell = board[startingRow][startingCol];
  return {
    row: startingRow,
    col: startingCol,
    cell: startingCell,
  };
};

const Board = () => {
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState(createBoard(BOARD_SIZE));
  const [snake, setSnake] = useState(
    new LinkedList(getStartingSnakeValue(board)),
  );
  const [snakeCells, setSnakeCells] = useState(
    new Set([snake.head.value.cell]),
  );
  const [foodCell, setFoodCell] = useState(snake.head.value.cell + 5);
  const [direction, setDirection] = useState(Direction.RIGHT);
  const [foodShouldReverseDirection, setFoodShouldReverseDirection] = useState(
    false,
  );

  useEffect(() => {
    window.addEventListener('keydown', e => { //keydown to register arrow keys on keyboard
      handleKeyDown(e);
    })
  }, []);

  // `useInterval` is needed; you can't naively do `setInterval` in the
  // `useEffect` above. See the article linked above the `useInterval`
  // definition for details.
  useInterval(() => {
    moveSnake();
  }, 150);

  const handleKeyDown = e => {
    const newDirection = getDirectionFromKey(e.key);
    const isValidDirection = newDirection !== '';
    if (!isValidDirection) return;
    const snakeWillRunIntoItself = getOppositeDirection(newDirection) === direction && snakeCells.size > 1;
  // Note: this functionality is currently broken, for the same reason that
  // `useInterval` is needed. Specifically, the `direction` and `snakeCells`
  // will currently never reflect their "latest version" when `handleKeydown`
  // is called.
  if (snakeWillRunIntoItself) return;
    setDirection(newDirection);
  }

  const moveSnake = () => {
    // const currentHeadCoords = snake.head;
    const currentHeadCoords = {
      row: snake.head.value.row,
      col: snake.head.value.col,
    };

    const nextHeadCoords = getCoordsInDirection(currentHeadCoords, direction);
    if (isOutOfBounds(nextHeadCoords, board)) {
      handleGameOver()
      return;
    }

    const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col]
    if (snakeCells.has(nextHeadCell)) { //has() returns a boolean indicating whether an element with the specified key exists or not in map.  equivalent of includes() for array
      handleGameOver();
      return;
    }

    const newHead = new LinkedListNode({
      row: currentHeadCoords.row,
      col: currentHeadCoords.col,
      cell: nextHeadCell,
    });

    const currentHead = snake.head;
    snake.head = newHead;
    currentHead.next = newHead;

    const newSnakeCells = new Set(snakeCells);
    newSnakeCells.delete(snake.tail.value.value);
    newSnakeCells.add(nextHeadCell);

    snake.tail = snake.tail.next;
    if (snake.tail === null) {
      snake.tail = snake.head;
    }

    const foodConsumed = nextHeadCell === foodCell;
    if (foodConsumed) {
      // This function mutates newSnakeCells.
      growSnake(newSnakeCells);
    if (foodShouldReverseDirection) {
      reverseSnake();
      handleFoodConsumption(); //if the next head value would be on the food (red sq same place as green) ---> then we eat food
      }
      setSnakeCells(newSnakeCells);
    }
  };

  // This function mutates newSnakeCells.
  const growSnake = (newSnakeCells) => {
    const growthNodeCoords = getGrowthNodeCoords(snake.tail, direction);
    if (isOutOfBounds(growthNodeCoords, board)) {
            // Snake is positioned such that it can't grow; don't do anything.
      return;
    }
    const newTailCell = board[growthNodeCoords.row][growthNodeCoords.col];
    const newTail = new LinkedListNode({
      row: growthNodeCoords.row,
      col: growthNodeCoords.col,
      cell: newTailCell
    });
    const currentTail = snake.tail;
    snake.tail = newTail;
    snake.tail.next = currentTail;

    newSnakeCells.add(newTailCell);
  }

  const reverseSnake = () => {
    const tailNextNodeDirection = getNextNodeDirection(snake.tail, direction);
    const newDirection = getOppositeDirection(tailNextNodeDirection);
    setDirection(newDirection);

    // The tail of the snake is really the head of the linked list, which
  // is why we have to pass the snake's tail to `reverseLinkedList`.
    reverseLinkedList(snake.tail);
    const snakeHead = snake.head;
    snake.head = snake.tail;
    snake.tail = snakeHead; //these 3 lines are swopping it all over
  }

  const handleFoodConsumption = (newSnakeCells) => { //this function just updates where the next food is going to be using the random function
    const maxPossibleCellValues = BOARD_SIZE * BOARD_SIZE;
    let nextFoodCell;
    while (true) {
      const nextFoodCell = randomIntFromInterval(1, maxPossibleCellValues); //pick a random number between 1 and the max cell value
      if (snakeCells.has(nextFoodCell) || foodCell === nextFoodCell) {
        continue; //while loop to keep generating random numbers until we find one that is not current food cell or snake cell
      }
      break;
    }

    const nextFoodShouldReverseDirection = Math.random() < PROBABILITY_OF_DIRECTION_REVERSAL_FOOD;
    setFoodCell(nextFoodCell);
    setFoodShouldReverseDirection(nextFoodShouldReverseDirection);
    setScore(score + 1);
  }

  const handleGameOver = () => {
    setScore(0);
    const snakeStartingValue = getStartingSnakeValue(board);
    setSnake(new LinkedListNode(snakeStartingValue));
    setFoodCell(snakeStartingValue.cell + 5);
    setSnakeCells(new Set([snakeStartingValue.cell]));
    setDirection(Direction.RIGHT);
  }

  return (
    <div>
    <h1>Score: {score}</h1>
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cellValue, cellIndex) => {
            const className = getCellClassName(
              cellValue,
              foodCell,
              foodShouldReverseDirection,
              snakeCells,
            );
            return <div key={cellIndex} className={className}></div>;
            })}
         </div>
        ))}
      </div>
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

  const getCoordsInDirection = (coords, direction) => {
    if (direction === Direction.UP) {
      return {
        row: coords.row -1,
        col: coords.col,
      }
    }
    if (direction === Direction.RIGHT) {
      return {
        row: coords.row,
        col: coords.col +1,
      }
    }
    if (direction === Direction.DOWN) {
      return {
        row: coords.row +1,
        col: coords.col,
      }
    }
    if (direction === Direction.LEFT) {
      return {
        row: coords.row,
        col: coords.col -1,
      }
    }
  }

  const isOutOfBounds = (coords, board) => {
    const {row, col} = coords;
    if (row < 0 || col < 0) return true;
    if (row >= board.length || col >= board[0].length) return true;
    return false;
  }

  const getDirectionFromKey = key => {
    if (key === 'ArrowUp') return Direction.UP;
    if (key === 'ArrowRight') return Direction.RIGHT;
    if (key === 'ArrowDown') return Direction.DOWN;
    if (key === 'ArrowLeft') return Direction.LEFT;
    return ''; //return an empty string if key is not one of the 4 arrow keys
  }

  const getNextNodeDirection = (node, currentDirection) => {
    if (node.next === null) return currentDirection;
    const {row: currentRow, col: currentCol} = node.value;
    const {row: nextRow, col: nextCol} = node.next.value;
    if (nextRow === currentRow && nextCol === currentCol + 1) {
      return Direction.RIGHT;
    }
    if (nextRow === currentRow && nextCol === currentCol - 1) {
      return Direction.LEFT;
    }
    if (nextCol === currentCol && nextRow === currentRow + 1) {
      return Direction.DOWN;
    }
    if (nextCol === currentCol && nextRow === currentRow - 1) {
      return Direction.UP;
    }
    return '';
  };

  const getGrowthNodeCoords = (snakeTail, currentDirection) => {
    const tailNextNodeDirection = getNextNodeDirection (
      snakeTail,
      currentDirection,
    );
    const growthDirection = getOppositeDirection(tailNextNodeDirection);
    const currentTailCoords = {
      row: snakeTail.value.row,
      col: snakeTail.value.col,
    };
    const growthNodeCoords = getCoordsInDirection(
      currentTailCoords,
      growthDirection
    );
    return growthNodeCoords;
  }

  const getOppositeDirection = direction => {
    if (direction === Direction.UP) return Direction.DOWN;
    if (direction === Direction.RIGHT) return Direction.LEFT;
    if (direction === Direction.DOWN) return Direction.UP;
    if (direction === Direction.LEFT) return Direction.RIGHT;
  };

const getCellClassName = (cellValue, foodCell, foodShouldReverseDirection, snakeCells) => {
  let className = 'cell';
  if (cellValue === foodCell) {
    if (foodShouldReverseDirection) {
      className = 'cell cell-purple';
    } else {
      className = 'cell cell-red';
    }
  }
  if (snakeCells.has(cellValue)) {
    className = 'cell cell-green'
  }
  return className;
}

export default Board;
//.fill() takes 3 arguments, first to last index you want to fill and third argument is with what you want to fill it

// new Array(BOARD_SIZE).fill(0).map((row) => newArray(BOARD_SIZE).fill(0)),
