import React, { useState, useEffect } from "react";
import styles from "./game1.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const words = [
  "javascript", "react", "developer", "computer", "algorithm",
  "variable", "object", "string", "number", "boolean"
];

const Hangman = () => {
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [showRules, setShowRules] = useState(false); // New state for rules dialog
  const maxMistakes = 6;
  const navigate = useNavigate();
  const currentLevel = 'level-1';

  useEffect(() => {
    setWord(words[Math.floor(Math.random() * words.length)].toUpperCase());
    setStartTime(Date.now());
  }, []);

  const handleGuess = (letter) => {
    if (gameOver || guessedLetters.includes(letter)) return;

    setGuessedLetters(prevLetters => [...prevLetters, letter]);

    if (!word.includes(letter)) {
      setMistakes(prevMistakes => prevMistakes + 1);
    }
  };

  const displayWord = () => {
    return word
      .split("")
      .map(letter => (guessedLetters.includes(letter) ? letter : "_"))
      .join(" ");
  };

  const updateUserScore = async () => {
    const endTime = Date.now();
    const completionTime = Math.floor((endTime - startTime) / 1000);
    
    try {
      const token = localStorage.getItem('refreshToken');
      console.log("Updating score with token:", token);
  
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

  useEffect(() => {
    if (mistakes >= maxMistakes) {
      setGameOver(true);
    } else if (word && word.split("").every(letter => guessedLetters.includes(letter))) {
      setGameOver(true);
      setLevelCompleted(true);
      
      updateUserScore().then(success => {
        const timer = setTimeout(() => {
          navigate("/game/2");
        }, 2000);
        return () => clearTimeout(timer);
      });
    }
  }, [mistakes, guessedLetters, word, navigate]);

  const resetGame = () => {
    setWord(words[Math.floor(Math.random() * words.length)].toUpperCase());
    setGuessedLetters([]);
    setMistakes(0);
    setGameOver(false);
    setLevelCompleted(false);
    setStartTime(Date.now());
  };

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  return (
    <div className={styles.container}>
      <div className={styles.hangman}>
        <h1>Hangman</h1>
        
        {/* Rules Button */}
        <button onClick={toggleRules} className={styles.rulesButton}>
          Show Rules
        </button>

        {/* Rules Dialog */}
        {showRules && (
          <div className={styles.rulesDialog}>
            <div className={styles.rulesContent}>
              <h2>Hangman Game Rules</h2>
              <ol>
                <li>Guess the hidden word by selecting letters</li>
                <li>Each correct letter reveals its position in the word</li>
                <li>Each incorrect guess adds to your mistakes</li>
                <li>You can make up to {maxMistakes} mistakes</li>
                <li>Win by guessing all letters before making too many mistakes</li>
                <li>All words are related to programming</li>
              </ol>
              <button onClick={toggleRules} className={styles.closeButton}>
                Close
              </button>
            </div>
          </div>
        )}

        <p className={styles.word}>{displayWord()}</p>
        <p className={styles.mistakes}>Mistakes: {mistakes} / {maxMistakes}</p>

        <div className={styles.alphabet}>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => (
            <button
              key={letter}
              className={styles.letter}
              onClick={() => handleGuess(letter)}
              disabled={guessedLetters.includes(letter) || gameOver}
            >
              {letter}
            </button>
          ))}
        </div>

        <button onClick={resetGame} className={styles.resetButton}>
          Restart
        </button>

        {gameOver && (
          <p className={`${styles.gameOver} ${mistakes >= maxMistakes ? styles.lose : styles.win}`}>
            {mistakes >= maxMistakes 
              ? `You Lost! 😞 The word was ${word}` 
              : "You Won! 🎉 Moving to next level..."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Hangman;