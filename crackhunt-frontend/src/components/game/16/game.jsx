import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './game16.module.css';
import axios from 'axios';

const HexGame = () => {
  const SIZE = 11;
  const [board, setBoard] = useState(Array(SIZE).fill().map(() => Array(SIZE).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [moves, setMoves] = useState(0);
  const navigate = useNavigate();
  const currentLevel = 'level-16';

  // Hex neighbor offsets for even-r offset coordinates
  const evenROffsets = {
    even: [
      [0, -1], [1, -1],   // Top neighbors
      [-1, 0], [1, 0],    // Side neighbors
      [0, 1], [1, 1]      // Bottom neighbors
    ],
    odd: [
      [-1, -1], [0, -1],  // Top neighbors
      [-1, 0], [1, 0],    // Side neighbors
      [-1, 1], [0, 1]     // Bottom neighbors
    ]
  };

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

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setBoard(Array(SIZE).fill().map(() => Array(SIZE).fill(null)));
    setCurrentPlayer('red');
    setWinner(null);
    setAiThinking(false);
    setGameCompleted(false);
    setStartTime(Date.now());
    setMoves(0);
  };

  const getNeighbors = (x, y) => {
    const parity = y % 2 === 0 ? 'even' : 'odd';
    return evenROffsets[parity].map(([dx, dy]) => [x + dx, y + dy]);
  };

  const checkWin = (board, player) => {
    const visited = Array(SIZE).fill().map(() => Array(SIZE).fill(false));
    const queue = [];
    
    // Initialize queue with starting edge cells
    if (player === 'red') {
      for (let x = 0; x < SIZE; x++) {
        if (board[0][x] === player) {
          queue.push([x, 0]);
          visited[0][x] = true;
        }
      }
    } else {
      for (let y = 0; y < SIZE; y++) {
        if (board[y][0] === player) {
          queue.push([0, y]);
          visited[y][0] = true;
        }
      }
    }

    // Perform BFS
    while (queue.length > 0) {
      const [cx, cy] = queue.shift();

      // Check if reached opposite edge
      if (player === 'red' && cy === SIZE - 1) return true;
      if (player === 'blue' && cx === SIZE - 1) return true;

      // Check all hex neighbors
      const neighbors = getNeighbors(cx, cy);
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && 
            board[ny][nx] === player && !visited[ny][nx]) {
          visited[ny][nx] = true;
          queue.push([nx, ny]);
        }
      }
    }

    return false;
  };

  const calculatePathPotential = (board, player) => {
    const distance = Array(SIZE).fill().map(() => Array(SIZE).fill(Infinity));
    const queue = [];
    
    // Initialize distances for starting edge
    if (player === 'red') {
      for (let x = 0; x < SIZE; x++) {
        if (board[0][x] === player) {
          distance[0][x] = 0;
          queue.push([x, 0]);
        } else if (board[0][x] === null) {
          distance[0][x] = 1;
          queue.push([x, 0]);
        }
      }
    } else {
      for (let y = 0; y < SIZE; y++) {
        if (board[y][0] === player) {
          distance[y][0] = 0;
          queue.push([0, y]);
        } else if (board[y][0] === null) {
          distance[y][0] = 1;
          queue.push([0, y]);
        }
      }
    }

    // Dijkstra's algorithm to find shortest path potential
    while (queue.length > 0) {
      queue.sort((a, b) => distance[a[1]][a[0]] - distance[b[1]][b[0]]);
      const [cx, cy] = queue.shift();

      // Check neighbors
      const neighbors = getNeighbors(cx, cy);
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
          let newDist = distance[cy][cx];
          if (board[ny][nx] === player) {
            newDist += 0;
          } else if (board[ny][nx] === null) {
            newDist += 1;
          } else {
            continue; // opponent's piece - can't move through
          }

          if (newDist < distance[ny][nx]) {
            distance[ny][nx] = newDist;
            queue.push([nx, ny]);
          }
        }
      }
    }

    // Find minimum distance to opposite edge
    let minDistance = Infinity;
    if (player === 'red') {
      for (let x = 0; x < SIZE; x++) {
        minDistance = Math.min(minDistance, distance[SIZE-1][x]);
      }
    } else {
      for (let y = 0; y < SIZE; y++) {
        minDistance = Math.min(minDistance, distance[y][SIZE-1]);
      }
    }

    return minDistance;
  };

  const makeMove = (x, y) => {
    if (winner || board[y][x] !== null || aiThinking) return;

    const newBoard = board.map(row => [...row]);
    newBoard[y][x] = currentPlayer;
    setBoard(newBoard);
    setMoves(prevMoves => prevMoves + 1);

    if (checkWin(newBoard, currentPlayer)) {
      setWinner(currentPlayer);
      if (currentPlayer === 'red') {
        setGameCompleted(true);
        updateUserScore().then(() => {
          setTimeout(() => {
            navigate('/game-complete');
          }, 2000);
        });
      }
      return;
    }

    const nextPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    setCurrentPlayer(nextPlayer);

    if (nextPlayer === 'blue' && !winner) {
      setAiThinking(true);
      setTimeout(() => makeAIMove(newBoard), 500);
    }
  };

  const makeAIMove = (currentBoard) => {
    const emptyCells = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (currentBoard[y][x] === null) {
          emptyCells.push([x, y]);
        }
      }
    }

    if (emptyCells.length === 0) {
      setAiThinking(false);
      return;
    }

    // Enhanced AI with path potential evaluation
    let bestScore = -Infinity;
    let bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    for (const [x, y] of emptyCells) {
      let score = 0;

      // Immediate win check
      const testBoardWin = currentBoard.map(row => [...row]);
      testBoardWin[y][x] = 'blue';
      if (checkWin(testBoardWin, 'blue')) {
        bestMove = [x, y];
        bestScore = Infinity;
        break;
      }

      // Block opponent's immediate win
      const testBoardBlock = currentBoard.map(row => [...row]);
      testBoardBlock[y][x] = 'red';
      if (checkWin(testBoardBlock, 'red')) {
        score += 10000;
      }

      // Calculate path potentials
      const bluePotential = calculatePathPotential(currentBoard, 'blue');
      const redPotential = calculatePathPotential(currentBoard, 'red');
      
      // Test this move's effect on potentials
      const testBoard = currentBoard.map(row => [...row]);
      testBoard[y][x] = 'blue';
      const newBluePotential = calculatePathPotential(testBoard, 'blue');
      const newRedPotential = calculatePathPotential(testBoard, 'red');

      // Score based on improving our path and blocking opponent
      score += (bluePotential - newBluePotential) * 100;
      score += (redPotential - newRedPotential) * 50;

      // Center control bonus
      const centerDist = Math.sqrt(Math.pow(x - SIZE/2, 2) + Math.pow(y - SIZE/2, 2));
      score += (SIZE - centerDist) * 2;

      // Randomness to make AI less predictable
      score += Math.random() * 20;

      if (score > bestScore) {
        bestScore = score;
        bestMove = [x, y];
      }
    }

    // Make the AI move
    const [x, y] = bestMove;
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[y][x] = 'blue';
    setBoard(newBoard);

    if (checkWin(newBoard, 'blue')) {
      setWinner('blue');
    } else {
      setCurrentPlayer('red');
    }
    
    setAiThinking(false);
  };

  const renderHex = (x, y) => {
    const value = board[y][x];
    let hexClass = styles.hex;
    if (value === 'red') hexClass += ` ${styles.hexRed}`;
    if (value === 'blue') hexClass += ` ${styles.hexBlue}`;
    if (value === null && !winner && !aiThinking && currentPlayer === 'red') hexClass += ` ${styles.hexClickable}`;

    return (
      <div 
        key={`${x}-${y}`}
        className={hexClass}
        onClick={() => makeMove(x, y)}
        style={{
          gridColumn: x + 1,
          gridRow: y + 1
        }}
      >
        <div className={styles.hexTop}></div>
        <div className={styles.hexMiddle}></div>
        <div className={styles.hexBottom}></div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {gameCompleted && (
        <div className={styles.completionScreen}>
          <div className={styles.completionContent}>
            <h1 className={styles.completionTitle}>CONGRATULATIONS!</h1>
            <p className={styles.completionMessage}>
              You've successfully completed all the games in this challenge! 
              Your strategic thinking and problem-solving skills have been 
              proven exceptional.
            </p>
            <div className={styles.gameStats}>
              <p>Total Moves: {moves}</p>
            </div>
            <button 
              className={styles.continueButton}
              onClick={() => {
                updateUserScore().then(() => {
                  navigate('/game-complete');
                });
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div className={styles.hexGame}>
        <h1>Hex</h1>
        
        <div className={styles.gameInfo}>
          <div className={`${styles.playerTurn} ${currentPlayer === 'red' ? styles.playerRed : styles.playerBlue}`}>
            {aiThinking ? 'AI is Thinking...' : winner ? 
              `${winner === 'red' ? 'You' : 'AI'} Won!` : 
              currentPlayer === 'red' ? 'Your Turn (Red)' : 'AI Turn (Blue)'}
          </div>
          <div className={styles.movesCounter}>
            Moves: {moves}
          </div>
        </div>
        
        <div className={styles.boardContainer}>
          <div className={styles.board}>
            {board.map((row, y) => 
              row.map((_, x) => renderHex(x, y)))
            }
          </div>
          <div className={`${styles.border} ${styles.borderTop}`}></div>
          <div className={`${styles.border} ${styles.borderBottom}`}></div>
          <div className={`${styles.border} ${styles.borderLeft}`}></div>
          <div className={`${styles.border} ${styles.borderRight}`}></div>
        </div>
        
        <div className={styles.controls}>
          <button onClick={resetGame} className={styles.button}>New Game</button>
          {winner && winner === 'red' && (
            <button 
              className={styles.button}
              onClick={() => {
                updateUserScore().then(() => {
                  navigate('/game-complete');
                });
              }}
            >
              Next Level
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HexGame;