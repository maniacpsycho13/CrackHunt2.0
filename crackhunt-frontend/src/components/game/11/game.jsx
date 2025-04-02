import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./game11.module.css";

const Sudoku = () => {
  const size = 9;
  const [grid, setGrid] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  // Sample Sudoku puzzle (moderate difficulty)
  const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];

  useEffect(() => {
    setGrid(puzzle.map((row) => [...row]));
  }, []);

  const updateScore = async (gameId, score) => {
    try {
      const response = await fetch("https://crackhunt2-0.onrender.com/api/user/update-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ level_completed:'level-11',completion_time:score,gameId, score }),
      });

      if (!response.ok) {
        throw new Error("Failed to update score");
      }

      const data = await response.json();
      console.log("Score updated successfully:", data);
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const handleChange = (row, col, value) => {
    if (!/^[1-9]?$/.test(value)) return;
    const newGrid = [...grid];
    newGrid[row][col] = value ? parseInt(value) : 0;
    setGrid(newGrid);
  };

  const validateSudoku = (grid) => {
    const isValidBlock = (block) => {
      const set = new Set(block.filter((num) => num > 0));
      return set.size === block.length;
    };

    for (let i = 0; i < size; i++) {
      const row = grid[i];
      const col = grid.map((row) => row[i]);

      if (!isValidBlock(row) || !isValidBlock(col)) return false;

      if (i % 3 === 0) {
        for (let j = 0; j < size; j += 3) {
          const subgrid = [
            ...grid[i].slice(j, j + 3),
            ...grid[i + 1].slice(j, j + 3),
            ...grid[i + 2].slice(j, j + 3),
          ];
          if (!isValidBlock(subgrid)) return false;
        }
      }
    }
    return true;
  };

  const checkAnswer = () => {
    if (grid.flat().includes(0)) {
      setFeedback("Sudoku is not complete.");
      return;
    }
    if (validateSudoku(grid)) {
      setFeedback("Sudoku is correct!");
      setIsCompleted(true);
      updateScore(11, 100); // Assuming gameId 11 for Sudoku and score 100 for completion
    } else {
      setFeedback("Sudoku is incorrect.");
    }
  };

  const resetGame = () => {
    setGrid(puzzle.map((row) => [...row]));
    setFeedback("");
    setIsCompleted(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sudoku Game</h1>
      <div className={styles.board}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="text"
              maxLength="1"
              value={cell !== 0 ? cell : ""}
              disabled={puzzle[rowIndex][colIndex] !== 0}
              onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
              className={styles.cell}
            />
          ))
        )}
      </div>
      <button className={styles.button} onClick={checkAnswer}>
        Check Answer
      </button>
      <p className={styles.feedback}>{feedback}</p>

      {isCompleted && (
        <div className={styles.winMessage}>
          <h2 className={styles.winTitle}>Congratulations! 🎉</h2>
          <p>You've completed the sudoku</p>
          <div className={styles.winButtons}>
            <button className={styles.button} onClick={resetGame}>
              Restart
            </button>
            <button 
              className={`${styles.button} ${styles.nextLevelButton}`}
              onClick={() => navigate('/game/12')}
            >
              Next Level
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sudoku;