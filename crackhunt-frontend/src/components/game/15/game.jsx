import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./game15.module.css";
import axios from 'axios';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameStatus, setGameStatus] = useState("In Progress");
  const [winningLine, setWinningLine] = useState([]);
  const [animationPhase, setAnimationPhase] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [moves, setMoves] = useState(0);
  const navigate = useNavigate();
  const currentLevel = 'level-15';

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

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: line };
      }
    }
    
    if (!squares.includes(null)) {
      return { winner: "Draw", line: [] };
    }
    
    return { winner: null, line: [] };
  };

  const handleClick = (index) => {
    if (board[index] || gameStatus !== "In Progress") return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setMoves(prevMoves => prevMoves + 1);

    const result = calculateWinner(newBoard);
    if (result.winner) {
      setGameStatus(result.winner === "Draw" ? "Draw" : "Winner");
      setWinningLine(result.line);
      setAnimationPhase(true);
      
      // If player wins, update score and navigate to next level after 3 seconds
      if (result.winner === "X") {
        updateUserScore().then(() => {
          setTimeout(() => {
            navigate('/game/16');
          }, 3000);
        });
      }
      return;
    }

    setIsXNext(false);
  };

  const aiMove = () => {
    if (gameStatus !== "In Progress") return;

    const bestMove = findBestMove(board);
    if (bestMove !== -1) {
      const newBoard = [...board];
      newBoard[bestMove] = "O";
      setBoard(newBoard);
      setMoves(prevMoves => prevMoves + 1);

      const result = calculateWinner(newBoard);
      if (result.winner) {
        setGameStatus(result.winner === "Draw" ? "Draw" : "Winner");
        setWinningLine(result.line);
        setAnimationPhase(true);
        return;
      }
    }

    setIsXNext(true);
  };

  useEffect(() => {
    if (!isXNext) {
      setTimeout(aiMove, 500);
    }
  }, [isXNext]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus("In Progress");
    setWinningLine([]);
    setAnimationPhase(false);
    setStartTime(Date.now());
    setMoves(0);
  };

  const minimax = (newBoard, depth, isMaximizing) => {
    const result = calculateWinner(newBoard);
    if (result.winner === "X") return -10 + depth;
    if (result.winner === "O") return 10 - depth;
    if (result.winner === "Draw") return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = isMaximizing ? "O" : "X";
        let score = minimax(newBoard, depth + 1, !isMaximizing);
        newBoard[i] = null;
        bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
      }
    }
    
    return bestScore;
  };

  const findBestMove = (board) => {
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        let score = minimax(board, 0, false);
        board[i] = null;

        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    return move;
  };

  let statusText;
  if (gameStatus === "Winner") {
    statusText = `Winner: ${isXNext ? "X" : "O"}`;
  } else if (gameStatus === "Draw") {
    statusText = "It's a Draw!";
  } else {
    statusText = `Your Turn (X)`;
  }

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={`${styles.bgCircle} ${styles.circle1}`}></div>
        <div className={`${styles.bgCircle} ${styles.circle2}`}></div>
        <div className={`${styles.bgCircle} ${styles.circle3}`}></div>
      </div>

      <div className={styles.gameContainer}>
        <h1 className={styles.title}>Tic Tac Toe</h1>
        
        <div className={styles.statusContainer}>
          <div className={`${styles.status} ${gameStatus !== "In Progress" ? styles.statusHighlight : ""}`}>
            {statusText}
          </div>
          <div className={styles.movesCounter}>
            Moves: {moves}
          </div>
        </div>
        
        <div className={styles.board}>
          {board.map((cell, index) => (
            <button
              key={index}
              className={`${styles.cell} ${cell === "X" ? styles.xCell : cell === "O" ? styles.oCell : ""} 
                ${winningLine.includes(index) ? styles.winningCell : ""}`}
              onClick={() => handleClick(index)}
              disabled={!!cell || gameStatus !== "In Progress"}
            >
              {cell && (
                <span className={styles.cellContent}>
                  {cell}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className={styles.buttonContainer}>
          <button className={styles.resetButton} onClick={resetGame}>
            Restart Game
          </button>
          {gameStatus === "Winner" && (
            <button 
              className={styles.nextLevelButton}
              onClick={() => {
                updateUserScore().then(() => {
                  navigate('/game/16');
                });
              }}
            >
              Next Level
            </button>
          )}
        </div>
      </div>

      {gameStatus === "Winner" && animationPhase && (
        <div className={styles.confettiContainer}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={styles.confetti}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicTacToe;