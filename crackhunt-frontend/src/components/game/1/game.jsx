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
  const maxMistakes = 6;
  const navigate = useNavigate();
  const currentLevel = 'level-1'; // Set this based on the current game level

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
    const completionTime = Math.floor((endTime - startTime) / 1000); // Convert to seconds
    
    try {
      const token = localStorage.getItem('refreshToken'); // Assuming you store JWT in localStorage
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
      
      // Update score in the backend
      updateUserScore().then(success => {
        // Navigate to next level after 2 seconds
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

  return (
    <div className={styles.container}>
      <div className={styles.hangman}>
        <h1>Hangman</h1>
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