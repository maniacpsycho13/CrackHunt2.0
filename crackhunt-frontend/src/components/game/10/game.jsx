import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './game10.module.css';
import axios from 'axios';

const ReversiGame = () => {
  const [board, setBoard] = useState(Array(8).fill().map(() => Array(8).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('black');
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [validMoves, setValidMoves] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [moves, setMoves] = useState(0);
  const navigate = useNavigate();
  const currentLevel = "U2FsdGVkX1+4Ooh9YhajOqCbktiFEPIqQdgrZzAqxcI=";

  const updateUserScore = async () => {
    const endTime = Date.now();
    const completionTime = Math.floor((endTime - startTime) / 1000);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        "https://crackhunt2-0.onrender.com/api/user/update-score",
        {
          level_completed: currentLevel,
          completion_time: completionTime,
          moves: moves
        },
        { withCredentials: true }

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
    const newBoard = Array(8).fill().map(() => Array(8).fill(null));
    newBoard[3][3] = 'white';
    newBoard[3][4] = 'black';
    newBoard[4][3] = 'black';
    newBoard[4][4] = 'white';
    
    setBoard(newBoard);
    setCurrentPlayer('black');
    setGameOver(false);
    setScores({ black: 2, white: 2 });
    calculateValidMoves(newBoard, 'black');
    setAiThinking(false);
    setStartTime(Date.now());
    setMoves(0);
  };

  const calculateValidMoves = (board, player) => {
    const opponent = player === 'black' ? 'white' : 'black';
    const moves = [];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (board[y][x] !== null) continue;

        const directions = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],          [0, 1],
          [1, -1],  [1, 0], [1, 1]
        ];

        let isValid = false;

        for (const [dy, dx] of directions) {
          let ny = y + dy;
          let nx = x + dx;
          let foundOpponent = false;

          while (ny >= 0 && ny < 8 && nx >= 0 && nx < 8) {
            if (board[ny][nx] === opponent) {
              foundOpponent = true;
              ny += dy;
              nx += dx;
            } else if (board[ny][nx] === player && foundOpponent) {
              isValid = true;
              break;
            } else {
              break;
            }
          }

          if (isValid) break;
        }

        if (isValid) {
          moves.push({ x, y });
        }
      }
    }

    setValidMoves(moves);
    return moves;
  };

  const makeMove = (x, y) => {
    if (gameOver || board[y][x] !== null || !validMoves.some(move => move.x === x && move.y === y)) {
      return;
    }

    const newBoard = JSON.parse(JSON.stringify(board));
    const opponent = currentPlayer === 'black' ? 'white' : 'black';
    newBoard[y][x] = currentPlayer;

    setMoves(prevMoves => prevMoves + 1);

    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1],  [1, 0], [1, 1]
    ];

    let flipped = 0;

    for (const [dy, dx] of directions) {
      let ny = y + dy;
      let nx = x + dx;
      const toFlip = [];

      while (ny >= 0 && ny < 8 && nx >= 0 && nx < 8) {
        if (newBoard[ny][nx] === opponent) {
          toFlip.push([ny, nx]);
          ny += dy;
          nx += dx;
        } else if (newBoard[ny][nx] === currentPlayer && toFlip.length > 0) {
          toFlip.forEach(([fy, fx]) => {
            newBoard[fy][fx] = currentPlayer;
            flipped++;
          });
          break;
        } else {
          break;
        }
      }
    }

    setBoard(newBoard);
    const newBlackCount = countPieces(newBoard, 'black');
    const newWhiteCount = countPieces(newBoard, 'white');
    setScores({ black: newBlackCount, white: newWhiteCount });

    const nextPlayer = currentPlayer === 'black' ? 'white' : 'black';
    const nextMoves = calculateValidMoves(newBoard, nextPlayer);

    if (nextMoves.length === 0) {
      const currentMoves = calculateValidMoves(newBoard, currentPlayer);
      if (currentMoves.length === 0) {
        setGameOver(true);
        if (newBlackCount > newWhiteCount) {
          updateUserScore().then(() => {
            setTimeout(() => navigate('/game/11'), 2000);
          });
        }
      }
    } else {
      setCurrentPlayer(nextPlayer);
      
      if (nextPlayer === 'white') {
        setAiThinking(true);
        setTimeout(() => {
          makeAIMove(newBoard);
          setAiThinking(false);
        }, 800);
      }
    }
  };

  const countPieces = (board, player) => {
    return board.flat().filter(cell => cell === player).length;
  };

  const makeAIMove = (currentBoard) => {
    const moves = calculateValidMoves(currentBoard, 'white');
    
    if (moves.length === 0) {
      const nextMoves = calculateValidMoves(currentBoard, 'black');
      if (nextMoves.length === 0) {
        setGameOver(true);
        if (countPieces(currentBoard, 'black') > countPieces(currentBoard, 'white')) {
          updateUserScore().then(() => {
            setTimeout(() => navigate('/game/11'), 2000);
          });
        }
      } else {
        setCurrentPlayer('black');
      }
      return;
    }

    const evaluatedMoves = moves.map(move => {
      const { x, y } = move;
      let score = 0;
      
      if ((x === 0 || x === 7) && (y === 0 || y === 7)) score += 10;
      else if (x === 0 || x === 7 || y === 0 || y === 7) score += 3;
      
      if (
        (x === 1 && y === 1) || (x === 1 && y === 6) ||
        (x === 6 && y === 1) || (x === 6 && y === 6)
      ) score -= 5;
      
      score += Math.random() * 2;
      
      return { ...move, score };
    });
    
    evaluatedMoves.sort((a, b) => b.score - a.score);
    const bestMove = evaluatedMoves[0];
    const shouldMakeSuboptimalMove = Math.random() < 0.2 && evaluatedMoves.length > 1;
    const moveToMake = shouldMakeSuboptimalMove ? evaluatedMoves[1] : bestMove;
    
    const newBoard = JSON.parse(JSON.stringify(currentBoard));
    newBoard[moveToMake.y][moveToMake.x] = 'white';
    
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1],  [1, 0], [1, 1]
    ];

    for (const [dy, dx] of directions) {
      let ny = moveToMake.y + dy;
      let nx = moveToMake.x + dx;
      const toFlip = [];

      while (ny >= 0 && ny < 8 && nx >= 0 && nx < 8) {
        if (newBoard[ny][nx] === 'black') {
          toFlip.push([ny, nx]);
          ny += dy;
          nx += dx;
        } else if (newBoard[ny][nx] === 'white' && toFlip.length > 0) {
          toFlip.forEach(([fy, fx]) => {
            newBoard[fy][fx] = 'white';
          });
          break;
        } else {
          break;
        }
      }
    }

    setBoard(newBoard);
    const newBlackCount = countPieces(newBoard, 'black');
    const newWhiteCount = countPieces(newBoard, 'white');
    setScores({ black: newBlackCount, white: newWhiteCount });

    const nextMoves = calculateValidMoves(newBoard, 'black');
    if (nextMoves.length === 0) {
      const aiMoves = calculateValidMoves(newBoard, 'white');
      if (aiMoves.length === 0) {
        setGameOver(true);
        if (newBlackCount > newWhiteCount) {
          updateUserScore().then(() => {
            setTimeout(() => navigate('/game/11'), 2000);
          });
        }
      } else {
        setTimeout(() => {
          makeAIMove(newBoard);
        }, 800);
      }
    } else {
      setCurrentPlayer('black');
    }
  };

  const renderCell = (x, y) => {
    const cellValue = board[y][x];
    const isValidMove = validMoves.some(move => move.x === x && move.y === y) && currentPlayer === 'black' && !aiThinking;
    
    let cellClass = styles.cell;
    if (cellValue === 'black') cellClass += ` ${styles.cellBlack}`;
    if (cellValue === 'white') cellClass += ` ${styles.cellWhite}`;
    if (isValidMove) cellClass += ` ${styles.validMove}`;
    
    return (
      <div 
        key={`${x}-${y}`} 
        className={cellClass}
        onClick={() => !aiThinking && makeMove(x, y)}
      >
        {isValidMove && <div className={styles.hintDot}></div>}
      </div>
    );
  };

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Reversi (Othello)</h1>
      
      <div className={styles.gameContainer}>
        <div className={styles.gameInfo}>
          <div className={`${styles.playerTurn} ${currentPlayer === 'black' ? styles.playerTurnBlack : styles.playerTurnWhite}`}>
            {aiThinking ? 'AI is Thinking...' : currentPlayer === 'black' ? 'Your Turn (Black)' : 'AI Turn (White)'}
          </div>
          <div className={styles.scores}>
            <span className={styles.blackScore}>You: {scores.black}</span>
            <span className={styles.whiteScore}>AI: {scores.white}</span>
            <span className={styles.movesCount}>Moves: {moves}</span>
          </div>
        </div>
        
        <div className={styles.board}>
          {board.map((row, y) => (
            <div key={y} className={styles.row}>
              {row.map((_, x) => renderCell(x, y))}
            </div>
          ))}
        </div>
        
        <div className={styles.controls}>
          <button className={styles.button} onClick={resetGame}>New Game</button>
          <button className={styles.button} onClick={toggleRules}>
            {showRules ? 'Hide Rules' : 'Show Rules'}
          </button>
        </div>
      </div>
      
      {/* Rules Dialog */}
      {showRules && (
        <div className={styles.rulesDialog}>
          <div className={styles.rulesContent}>
            <h2>Reversi Game Rules</h2>
            <ol>
              <li><strong>Objective:</strong> Have more discs of your color than your opponent when the game ends.</li>
              <li><strong>Setup:</strong> The game starts with 2 black and 2 white discs in the center.</li>
              <li><strong>Black moves first:</strong> Players alternate turns placing one disc per turn.</li>
              <li><strong>Valid Move:</strong> You must place your disc adjacent to an opponent's disc so that it forms a straight line (horizontal, vertical, or diagonal) with another disc of your color, with one or more of the opponent's discs in between.</li>
              <li><strong>Flipping Discs:</strong> After placing your disc, flip all opponent's discs that are in a straight line between your new disc and another disc of your color.</li>
              <li><strong>No Valid Moves:</strong> If you can't make a valid move, your turn is skipped.</li>
              <li><strong>Game Ends:</strong> When neither player can make a valid move (usually when the board is full).</li>
              <li><strong>Winning:</strong> The player with the most discs of their color wins.</li>
            </ol>
            <button onClick={toggleRules} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      )}
      
      {gameOver && (
        <div className={styles.gameOver}>
          <div className={styles.gameOverContent}>
            <h2 className={styles.gameOverTitle}>Game Over!</h2>
            <p className={styles.gameOverMessage}>
              {scores.black > scores.white ? 'You Win!' : 
               scores.white > scores.black ? 'AI Wins!' : 'It\'s a Tie!'}
            </p>
            <p>Final Score: You {scores.black} - {scores.white} AI</p>
            <p>Total Moves: {moves}</p>
            <button className={styles.button} onClick={resetGame}>Play Again</button>
            {scores.black > scores.white && (
              <button 
                className={`${styles.button} ${styles.nextLevelButton}`}
                onClick={() => {
                  updateUserScore().then(() => {
                    navigate('/game/11')
                  });
                }}
              >
                Next Level
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReversiGame;