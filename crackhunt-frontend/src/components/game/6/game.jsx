import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './game6.module.css';
import axios from 'axios';

const BOARD_SIZE = 7;
const INITIAL_BOARD = [
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 2, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0]
];

const PegSolitaire = () => {
  const [board, setBoard] = useState(JSON.parse(JSON.stringify(INITIAL_BOARD)));
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const navigate = useNavigate();
  const currentLevel = 'level-6';

  useEffect(() => {
    resetGame();
  }, []);

  const updateUserScore = async () => {
    const endTime = Date.now();
    const completionTime = Math.floor((endTime - startTime) / 1000);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        "https://crackhunt2-0.onrender.com/api/user/update-score",
        {
          level_completed: currentLevel,
          completion_time: completionTime
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("Score updated:", response.data);
      return true;
    } catch (error) {
      console.error("Failed to update score:", error);
      return false;
    }
  };

  const resetGame = () => {
    setBoard(JSON.parse(JSON.stringify(INITIAL_BOARD)));
    setSelectedPeg(null);
    setMoves(0);
    setGameOver(false);
    setWon(false);
    setStartTime(Date.now());
  };

  const handlePegClick = (row, col) => {
    if (gameOver || board[row][col] === 0) return;

    if (selectedPeg === null && board[row][col] === 1) {
      setSelectedPeg({ row, col });
      return;
    }
    
    if (selectedPeg && selectedPeg.row === row && selectedPeg.col === col) {
      setSelectedPeg(null);
      return;
    }

    if (selectedPeg) {
      if (board[row][col] === 2 && isValidMove(selectedPeg.row, selectedPeg.col, row, col)) {
        makeMove(selectedPeg.row, selectedPeg.col, row, col);
      } else if (board[row][col] === 1) {
        setSelectedPeg({ row, col });
      }
    }
  };

  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    if ((rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2)) {
      const midRow = (fromRow + toRow) / 2;
      const midCol = (fromCol + toCol) / 2;
      return board[midRow][midCol] === 1;
    }
    return false;
  };

  const makeMove = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = [...board.map(row => [...row])];
    const midRow = (fromRow + toRow) / 2;
    const midCol = (fromCol + toCol) / 2;

    newBoard[fromRow][fromCol] = 2;
    newBoard[midRow][midCol] = 2;
    newBoard[toRow][toCol] = 1;

    setBoard(newBoard);
    setSelectedPeg(null);
    setMoves(moves + 1);
    checkWinCondition(newBoard);
  };

  const checkWinCondition = (currentBoard) => {
    let pegCount = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (currentBoard[i][j] === 1) pegCount++;
      }
    }
    if (pegCount === 1) {
      setWon(true);
      updateUserScore().then(() => {
        setTimeout(() => navigate("/game/7"), 2000);
      });
    }
  };

  return (
    <div className={styles.gameWrapper}>
      <div className={styles.gameContainer}>
        <h2 className={styles.title}>Peg Solitaire</h2>
        <div className={styles.gameInfo}>
          <span className={styles.moves}>Moves: {moves}</span>
          <button className={styles.resetButton} onClick={resetGame}>Reset</button>
        </div>
        <div className={styles.board}>
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, colIndex) => (
                <div 
                  key={colIndex} 
                  className={`${styles.cell} ${cell === 0 ? styles.invalid : ''}`}
                  onClick={() => handlePegClick(rowIndex, colIndex)}
                >
                  {cell === 1 && (
                    <div className={`${styles.peg} ${
                      selectedPeg?.row === rowIndex && selectedPeg?.col === colIndex ? styles.selected : ''
                    }`} />
                  )}
                  {cell === 2 && <div className={styles.empty} />}
                </div>
              ))}
            </div>
          ))}
        </div>
        {(gameOver || won) && (
          <div className={styles.gameOverlay}>
            <div className={styles.gameOverMessage}>
              <h2>{won ? "You Win! 🎉" : "Game Over!"}</h2>
              <p>Total Moves: {moves}</p>
              <button className={styles.restartButton} onClick={resetGame}>Play Again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PegSolitaire;