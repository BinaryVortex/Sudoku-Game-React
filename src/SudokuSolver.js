import React, { useState } from "react";
import "./SudokuSolver.scss";

const GRID_SIZE = 9;

function getInitialGrid() {
  return Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill("")
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SudokuSolver = () => {
  const [grid, setGrid] = useState(getInitialGrid());
  const [solvedCells, setSolvedCells] = useState([]); // Array of [row, col]
  const [userInputCells, setUserInputCells] = useState([]);

  const handleInputChange = (row, col, value) => {
    const sanitized = value.replace(/[^1-9]/g, "");
    setGrid((prev) => {
      const newGrid = prev.map((r, i) =>
        r.map((cell, j) => (i === row && j === col ? sanitized : cell))
      );
      return newGrid;
    });
  };

  const getGridAsNumbers = () =>
    grid.map((row) => row.map((cell) => (cell !== "" ? parseInt(cell) : 0)));

  const markUserInputCells = (sudokuArray) => {
    let newUserInput = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (sudokuArray[row][col] !== 0) {
          newUserInput.push(`${row}-${col}`);
        }
      }
    }
    setUserInputCells(newUserInput);
  };

  const handleSolve = async () => {
    const sudokuArray = getGridAsNumbers();
    markUserInputCells(sudokuArray);

    const solvedGrid = sudokuArray.map((row) => [...row]);
    let newSolvedCells = [];

    const solveHelper = async () => {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (solvedGrid[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValidMove(solvedGrid, row, col, num)) {
                solvedGrid[row][col] = num;

                if (await solveHelper()) {
                  newSolvedCells.push([row, col]);
                  setGrid((prev) => {
                    const copy = prev.map((r) => [...r]);
                    copy[row][col] = num.toString();
                    return copy;
                  });
                  setSolvedCells([...newSolvedCells]);
                  await sleep(20);
                  return true;
                }
                solvedGrid[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    const found = await solveHelper();

    if (!found) {
      alert("No solution exists for the given Sudoku puzzle.");
    } else {
      setSolvedCells(newSolvedCells);
      setGrid(solvedGrid.map((row) => row.map((v) => v.toString())));
    }
  };

  const isSolvedCell = (row, col) =>
    solvedCells.some(([r, c]) => r === row && c === col);
  const isUserInputCell = (row, col) =>
    userInputCells.includes(`${row}-${col}`);

  return (
    <div className="sudoku-root">
      <h1>Sudoku Solver</h1>
      <div className="sudoku-container">
        <table>
          <tbody>
            {Array.from({ length: GRID_SIZE }).map((_, row) => (
              <tr key={row}>
                {Array.from({ length: GRID_SIZE }).map((_, col) => (
                  <td key={col}>
                    <input
                      type="text"
                      maxLength="1"
                      className={
                        "cell" +
                        (isSolvedCell(row, col) ? " solved" : "") +
                        (isUserInputCell(row, col) ? " user-input" : "")
                      }
                      value={grid[row][col]}
                      onChange={(e) =>
                        handleInputChange(row, col, e.target.value)
                      }
                      disabled={isUserInputCell(row, col)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button id="solve-btn" onClick={handleSolve}>
        Solve Puzzle
      </button>
    </div>
  );
};

function isValidMove(board, row, col, num) {
  for (let i = 0; i < GRID_SIZE; i++) {
    if (board[row][i] === num || board[i][col] === num) {
      return false;
    }
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if (board[i][j] === num) {
        return false;
      }
    }
  }
  return true;
}

export default SudokuSolver;