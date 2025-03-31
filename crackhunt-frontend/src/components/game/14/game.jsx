import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './game14.module.css';
import axios from 'axios';

const KakuroGame = () => {
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'won'
  const [selectedCell, setSelectedCell] = useState(null);
  const [playerGrid, setPlayerGrid] = useState(Array(8).fill().map(() => Array(8).fill(0)));
  const [showRules, setShowRules] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [moves, setMoves] = useState(0);
  const navigate = useNavigate();
  const currentLevel = 'level-14';

  // Puzzle definition
  const puzzle = [
    [0, 0, [0,4], [0,10], [0,16], 0, [0,24], [0,17]],
    [0, [16,4], -1, -1, -1, [0,24], -1, -1],
    [[0,23], -1, -1, -1, -1, -1, -1, -1],
    [[0,16], -1, -1, -1, [16,3], -1, -1, 0],
    [[0,20], -1, -1, -1, -1, -1, -1, [0,15]],
    [0, [16,12], -1, -1, -1, -1, -1, -1],
    [[0,17], -1, -1, -1, [0,12], -1, -1, 0],
    [[0,11], -1, -1, 0, [0,7], -1, -1, 0]
  ];

  // Solution grid
  const solution = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 3, 2, 0, 9, 8],
    [0, 5, 7, 4, 3, 2, 1, 1],
    [0, 8, 5, 3, 0, 1, 2, 0],
    [0, 9, 2, 4, 1, 3, 1, 0],
    [0, 0, 3, 4, 5, 7, 8, 9],
    [0, 9, 8, 7, 0, 5, 7, 0],
    [0, 2, 9, 0, 0, 3, 4, 0]
  ];

  // Add updateUserScore function
  const updateUserScore = async () => {
    const endTime = Date.now();
    const completionTime = Math.floor((endTime - startTime) / 1000); // Convert to seconds
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        "https://crackhunt2-0.onrender.com/api/user/update-score",
        {
          level_completed: currentLevel,
          completion_time: completionTime,
          moves: moves // Number of moves made
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

  const startGame = () => {
    setGameState('playing');
    setPlayerGrid(Array(8).fill().map(() => Array(8).fill(0)));
    setSelectedCell(null);
    setStartTime(Date.now());
    setMoves(0);
  };

  const restartGame = () => {
    setPlayerGrid(Array(8).fill().map(() => Array(8).fill(0)));
    setSelectedCell(null);
    setGameState('playing');
    setStartTime(Date.now());
    setMoves(0);
  };

  const selectCell = (row, col) => {
    if (puzzle[row][col] !== -1) return;
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    const newGrid = [...playerGrid];
    
    if (num === 0) {
      // Clear cell
      newGrid[row][col] = 0;
    } else {
      // Set number
      newGrid[row][col] = num;
      setMoves(prevMoves => prevMoves + 1);
    }
    
    setPlayerGrid(newGrid);
    validateMove(newGrid, row, col);
    
    if (checkWin(newGrid)) {
      updateUserScore().then(() => {
        setTimeout(() => navigate('/game/15'), 2000);
      });
    }
  };

  const validateMove = (grid, row, col) => {
    return grid[row][col] === solution[row][col];
  };

  const checkWin = (grid) => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (puzzle[i][j] === -1 && grid[i][j] !== solution[i][j]) {
          return false;
        }
      }
    }
    setGameState('won');
    return true;
  };

  const handleKeyDown = (e) => {
    if (e.key >= '0' && e.key <= '9') {
      handleNumberInput(parseInt(e.key));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, playerGrid]);

  return (
    <div className={styles.container}>
      {gameState === 'start' && (
        <div className={styles.screen}>
          <h1 className={styles.title}>KAKURO</h1>
          <div className={styles.subtitle}>Mathematical Crossword Puzzle</div>
          <div className={styles.instructions}>
            <p className={styles.instructionsText}>Fill the grid with numbers 1-9 that sum to the given clues.</p>
            <div className={styles.rulesList}>
              <h3 className={styles.rulesTitle}>Rules:</h3>
              <ul className={styles.rulesItems}>
                <li className={styles.rulesItem}>Use numbers 1-9 only</li>
                <li className={styles.rulesItem}>No number can be repeated in a sum</li>
                <li className={styles.rulesItem}>Numbers must add up to the clue given</li>
                <li className={styles.rulesItem}>Empty cells must be filled with a single digit</li>
              </ul>
            </div>
          </div>
          <button className={`${styles.button} ${styles.startButton}`} onClick={startGame}>
            START GAME
          </button>
          <button className={`${styles.button} ${styles.rulesButton}`} onClick={() => setShowRules(true)}>
            HOW TO PLAY
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className={styles.screen}>
          <div className={styles.gameHeader}>
            <h2 className={styles.title}>KAKURO</h2>
            <div className={styles.gameControls}>
              <span>Moves: {moves}</span>
              <button className={styles.controlButton} onClick={() => setShowRules(true)}>
                Rules
              </button>
              <button className={styles.controlButton} onClick={restartGame}>
                Restart
              </button>
            </div>
          </div>

          <div className={styles.gameBoard}>
            <div className={styles.grid}>
              {puzzle.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  let cellClass = styles.cell;
                  let content = null;

                  if (cell === 0) {
                    cellClass += ` ${styles.blockedCell}`;
                  } else if (Array.isArray(cell)) {
                    cellClass += ` ${styles.clueCell}`;
                    content = (
                      <>
                        {cell[0] > 0 && <div className={styles.clueDown}>{cell[0]}</div>}
                        {cell[1] > 0 && <div className={styles.clueRight}>{cell[1]}</div>}
                      </>
                    );
                  } else {
                    cellClass += ` ${styles.emptyCell}`;
                    if (playerGrid[rowIndex][colIndex] > 0) {
                      content = playerGrid[rowIndex][colIndex];
                    }
                    if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
                      cellClass += ` ${styles.selectedCell}`;
                    }
                  }

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cellClass}
                      onClick={() => selectCell(rowIndex, colIndex)}
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>
            <div className={styles.numberPad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  className={styles.numBtn}
                  onClick={() => handleNumberInput(num)}
                >
                  {num}
                </button>
              ))}
              <button
                className={`${styles.numBtn} ${styles.clearBtn}`}
                onClick={() => handleNumberInput(0)}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className={styles.screen}>
          <h2 className={styles.title}>Congratulations!</h2>
          <div className={styles.winMessage}>
            <p>You've solved the Kakuro puzzle!</p>
            <p>Total Moves: {moves}</p>
            <div className={styles.sparkles}>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={styles.sparkle}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
          <div className={styles.winButtons}>
            <button className={styles.button} onClick={restartGame}>Play Again</button>
            <button 
              className={`${styles.button} ${styles.nextLevelButton}`}
              onClick={() => {
                updateUserScore().then(() => {
                  navigate('/game/15');
                });
              }}
            >
              Next Level
            </button>
          </div>
        </div>
      )}

      {showRules && (
        <div className={styles.modal} onClick={() => setShowRules(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowRules(false)}>
              ×
            </button>
            <h2 className={styles.title}>How to Play Kakuro</h2>
            <div className={styles.rulesContent}>
              <div className={styles.rulesSection}>
                <h3 className={styles.rulesSectionTitle}>Basic Rules:</h3>
                <ul className={styles.rulesItems}>
                  <li className={styles.rulesItem}>Fill empty cells with numbers 1-9</li>
                  <li className={styles.rulesItem}>Numbers in each run must sum to the clue number</li>
                  <li className={styles.rulesItem}>No number can be repeated in a run</li>
                  <li className={styles.rulesItem}>Clues are given as sums for rows (→) and columns (↓)</li>
                </ul>
              </div>
              <div className={styles.rulesSection}>
                <h3 className={styles.rulesSectionTitle}>How to Play:</h3>
                <ol className={styles.rulesItems}>
                  <li className={styles.rulesItem}>Click an empty cell to select it</li>
                  <li className={styles.rulesItem}>Use the number pad to enter a number</li>
                  <li className={styles.rulesItem}>Click 'Clear' to remove a number</li>
                  <li className={styles.rulesItem}>Complete all runs to win the game</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KakuroGame;