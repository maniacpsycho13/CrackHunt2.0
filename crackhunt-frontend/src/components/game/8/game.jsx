import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './game8.module.css';
import axios from 'axios';

const MastermindGame = () => {
  const COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Turquoise
    '#FFD93D', // Yellow
    '#95A5A6', // Gray
    '#6C5CE7', // Purple
    '#A8E6CF'  // Mint
  ];

  const CODE_LENGTH = 4;
  const MAX_ATTEMPTS = 10;
  const navigate = useNavigate();

  const [secretCode, setSecretCode] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const currentLevel = 'level-8';

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
          moves: MAX_ATTEMPTS - attemptsLeft // Number of attempts used
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

  const generateSecretCode = () => {
    const code = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      code.push(Math.floor(Math.random() * COLORS.length));
    }
    return code;
  };

  const initializeGame = () => {
    setSecretCode(generateSecretCode());
    setCurrentGuess([]);
    setAttempts([]);
    setAttemptsLeft(MAX_ATTEMPTS);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const addColorToGuess = (colorIndex) => {
    if (currentGuess.length < CODE_LENGTH && !gameOver && !gameWon) {
      setCurrentGuess([...currentGuess, colorIndex]);
    }
  };

  const removeColorFromGuess = () => {
    if (currentGuess.length > 0 && !gameOver && !gameWon) {
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  };

  const checkGuess = () => {
    if (currentGuess.length !== CODE_LENGTH || gameOver || gameWon) return;

    const feedback = [];
    const codeCopy = [...secretCode];
    const guessCopy = [...currentGuess];

    // Check for correct color and position (black pegs)
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] === codeCopy[i]) {
        feedback.push('black');
        codeCopy[i] = null;
        guessCopy[i] = null;
      }
    }

    // Check for correct color but wrong position (white pegs)
    for (let i = 0; i < CODE_LENGTH; i++) {
      if (guessCopy[i] !== null) {
        const colorIndex = codeCopy.findIndex(color => color === guessCopy[i]);
        if (colorIndex !== -1) {
          feedback.push('white');
          codeCopy[colorIndex] = null;
        }
      }
    }

    // Sort feedback: black pegs first, then white pegs
    feedback.sort((a, b) => {
      if (a === 'black' && b !== 'black') return -1;
      if (b === 'black' && a !== 'black') return 1;
      return 0;
    });

    // Add empty pegs if needed
    while (feedback.length < CODE_LENGTH) {
      feedback.push('empty');
    }

    const newAttempts = [...attempts, {
      guess: [...currentGuess],
      feedback: [...feedback]
    }];

    setAttempts(newAttempts);
    setCurrentGuess([]);
    setAttemptsLeft(attemptsLeft - 1);

    // Check if player won
    const blackPegs = feedback.filter(f => f === 'black').length;
    if (blackPegs === CODE_LENGTH) {
      setGameWon(true);
      setGameOver(true);
      updateUserScore().then(() => {
        setTimeout(() => navigate('/game/9'), 2000);
      });
    } else if (attemptsLeft - 1 === 0) {
      setGameOver(true);
    }
  };

  const renderCurrentGuess = () => {
    return Array(CODE_LENGTH).fill().map((_, index) => (
      <div
        key={`current-${index}`}
        className={`${styles.guessPeg} ${currentGuess[index] === undefined ? styles.empty : ''}`}
        style={{ background: currentGuess[index] !== undefined ? COLORS[currentGuess[index]] : '' }}
        onClick={removeColorFromGuess}
      />
    ));
  };

  const renderAttempts = () => {
    return attempts.map((attempt, attemptIndex) => (
      <div key={attemptIndex} className={styles.attemptRow}>
        <div className={styles.pegs}>
          {attempt.guess.map((colorIndex, pegIndex) => (
            <div
              key={`${attemptIndex}-${pegIndex}`}
              className={styles.guessPeg}
              style={{ background: COLORS[colorIndex] }}
            />
          ))}
        </div>
        <div className={styles.feedback}>
          {attempt.feedback.map((fb, fbIndex) => (
            <div
              key={`${attemptIndex}-fb-${fbIndex}`}
              className={`${styles.feedbackPeg} ${styles[fb]}`}
            />
          ))}
        </div>
      </div>
    ));
  };

  const renderColorOptions = () => {
    return COLORS.map((color, index) => (
      <div
        key={`color-${index}`}
        className={styles.colorOption}
        style={{ background: color }}
        onClick={() => addColorToGuess(index)}
      />
    ));
  };

  const renderSecretCode = () => {
    return secretCode.map((colorIndex, index) => (
      <div
        key={`secret-${index}`}
        className={styles.guessPeg}
        style={{ background: COLORS[colorIndex] }}
      />
    ));
  };

  return (
    <div className={styles.mastermindContainer}>
      {!gameStarted ? (
        <div className={styles.startScreen}>
          <h1>MASTERMIND</h1>
          <div className={styles.instructions}>
            <p>Break the secret color code in 10 tries!</p>
            <div className={styles.colorGuide}>
              {COLORS.map((color, index) => (
                <div key={`guide-${index}`} className={styles.colorSample} style={{ background: color }} />
              ))}
            </div>
            <p>🎯 Select colors and click 'Check' to submit your guess</p>
            <p>⚫ Black peg = Correct color & position</p>
            <p>⚪ White peg = Correct color, wrong position</p>
          </div>
          <div className={styles.startButtons}>
            <button className={styles.startButton} onClick={initializeGame}>START GAME</button>
            <button className={styles.rulesButton} onClick={() => setShowRules(true)}>HOW TO PLAY</button>
          </div>
        </div>
      ) : (
        <div className={styles.gameScreen}>
          <div className={styles.gameHeader}>
            <h2>MASTERMIND</h2>
            <div className={styles.gameControls}>
              <button className={styles.rulesButton} onClick={() => setShowRules(true)}>Rules</button>
              <div className={styles.gameInfo}>
                <span className={styles.attemptsCount}>Attempts: {attemptsLeft}</span>
                <button className={styles.restartButton} onClick={initializeGame}>New Game</button>
              </div>
            </div>
          </div>

          <div className={styles.gameBoard}>
            <div className={styles.attemptsContainer}>
              {renderAttempts()}
            </div>
            
            <div className={styles.colorPicker}>
              <div className={styles.colors}>
                {renderColorOptions()}
              </div>
              <div className={styles.currentGuess}>
                {renderCurrentGuess()}
              </div>
              <button
                className={styles.checkButton}
                onClick={checkGuess}
                disabled={currentGuess.length !== CODE_LENGTH || gameOver}
              >
                Check
              </button>
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <div className={styles.modal} onClick={() => setShowRules(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowRules(false)}>×</button>
            <h2>How to Play</h2>
            <div className={styles.rulesContent}>
              <p>🎯 Break the secret color code in 10 attempts!</p>
              <div className={styles.rulesSection}>
                <h3>Colors Available:</h3>
                <div className={styles.colorGuide}>
                  {COLORS.map((color, index) => (
                    <div key={`rules-guide-${index}`} className={styles.colorSample} style={{ background: color }} />
                  ))}
                </div>
              </div>
              <div className={styles.rulesSection}>
                <h3>How to Play:</h3>
                <ul>
                  <li>Select colors to create your guess</li>
                  <li>Click 'Check' to submit your guess</li>
                  <li>Use the feedback pegs to deduce the code</li>
                </ul>
              </div>
              <div className={styles.rulesSection}>
                <h3>Feedback Pegs:</h3>
                <div className={styles.feedbackGuide}>
                  <div className={styles.feedbackItem}>
                    <div className={`${styles.feedbackPeg} ${styles.black}`} />
                    <span>Correct color & position</span>
                  </div>
                  <div className={styles.feedbackItem}>
                    <div className={`${styles.feedbackPeg} ${styles.white}`} />
                    <span>Correct color, wrong position</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameWon && (
        <div className={styles.winScreen}>
          <h2 className={styles.winTitle}>Congratulations! 🎉</h2>
          <p>You broke the code!</p>
          <p>Proceeding to Level 9...</p>
          <div className={styles.winButtons}>
            <button className={styles.restartButton} onClick={initializeGame}>Play Again</button>
          </div>
        </div>
      )}

      {gameOver && !gameWon && (
        <div className={styles.gameOverScreen}>
          <h2>Game Over!</h2>
          <p>The secret code was:</p>
          <div className={styles.secretCode}>
            {renderSecretCode()}
          </div>
          <div className={styles.winButtons}>
            <button className={styles.restartButton} onClick={initializeGame}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MastermindGame;