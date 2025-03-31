import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './game13.module.css';

const TowerOfHanoi = () => {
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'won'
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [towers, setTowers] = useState([[], [], []]);
  const [selectedDisk, setSelectedDisk] = useState(null);
  const navigate = useNavigate();
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  
  const numberOfDisks = 5;
  const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7', '#A8E6CF'];
  const minMoves = Math.pow(2, numberOfDisks) - 1; // 31 for 5 disks

  const updateScore = async (gameId, score) => {
    try {
      const response = await fetch("https://crackhunt2-0.onrender.com/api/user/update-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ level_completed:'level-13',completedTime:score,gameId, score }),
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

  const initializeGame = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset game state
    setMoves(0);
    setTime(0);
    setSelectedDisk(null);
    setGameState('playing');
    startTimeRef.current = new Date();
    
    // Initialize towers with disks
    const newTowers = [[], [], []];
    for (let i = numberOfDisks - 1; i >= 0; i--) {
      newTowers[0].push({
        size: i + 1,
        color: colors[i]
      });
    }
    setTowers(newTowers);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTime(Math.floor((new Date() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const handleTowerClick = (towerIndex) => {
    if (gameState !== 'playing') return;
    
    if (selectedDisk === null) {
      // Select a disk from this tower if it's the top disk
      if (towers[towerIndex].length > 0) {
        setSelectedDisk(towerIndex);
      }
    } else {
      // Attempt to move the selected disk to this tower
      moveDisk(selectedDisk, towerIndex);
      setSelectedDisk(null);
    }
  };

  const moveDisk = (fromTower, toTower) => {
    if (fromTower === toTower) return;
    if (towers[fromTower].length === 0) return;
    
    const movingDisk = towers[fromTower][towers[fromTower].length - 1];
    const targetDisk = towers[toTower][towers[toTower].length - 1];
    
    // Check if move is valid
    if (targetDisk && movingDisk.size > targetDisk.size) {
      return;
    }
    
    // Perform the move
    const newTowers = [...towers];
    const disk = newTowers[fromTower].pop();
    newTowers[toTower].push(disk);
    
    setTowers(newTowers);
    setMoves(moves + 1);
    
    // Check for win
    if (newTowers[2].length === numberOfDisks) {
      handleWin();
    }
  };

  const handleWin = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setGameState('won');
    // Calculate score based on performance (fewer moves = higher score)
    const efficiency = Math.max(0, 100 - Math.max(0, moves - minMoves) * 2);
    updateScore(13, efficiency); // Assuming gameId 13 for Tower of Hanoi
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      {gameState === 'start' && (
        <div className={styles.screen}>
          <h1 className={styles.title}>TOWER OF HANOI</h1>
          <div className={styles.instructions}>
            <p className={styles.instructionsText}>Move all disks from the first rod to the last rod</p>
            <p className={styles.instructionsText}>Rules:</p>
            <ul className={styles.instructionsList}>
              <li className={styles.instructionsItem}>Only one disk can be moved at a time</li>
              <li className={styles.instructionsItem}>A larger disk cannot be placed on top of a smaller disk</li>
              <li className={styles.instructionsItem}>Only the top disk of a stack can be moved</li>
            </ul>
            <div className={styles.gameInfo}>
              <p>Number of disks: {numberOfDisks}</p>
              <p>Minimum moves required: {minMoves}</p>
            </div>
          </div>
          <button className={styles.button} onClick={initializeGame}>
            START GAME
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className={styles.screen}>
          <div className={styles.gameHeader}>
            <h2 className={styles.title}>TOWER OF HANOI</h2>
            <div className={styles.gameInfoContainer}>
              <span>Moves: {moves}</span>
              <span>Time: {formatTime(time)}</span>
            </div>
            <button className={`${styles.button} ${styles.restartButton}`} onClick={initializeGame}>
              Restart
            </button>
          </div>

          <div className={styles.gameBoard}>
            <div className={styles.towers}>
              {[0, 1, 2].map((towerIndex) => (
                <div
                  key={`tower-${towerIndex}`}
                  className={`${styles.tower} ${selectedDisk === towerIndex ? styles.selectedTower : ''}`}
                  onClick={() => handleTowerClick(towerIndex)}
                >
                  <div className={styles.rod}></div>
                  <div className={styles.base}></div>
                  {towers[towerIndex].map((disk, diskIndex) => (
                    <div
                      key={`disk-${towerIndex}-${diskIndex}`}
                      className={styles.disk}
                      style={{
                        width: `${160 - (disk.size - 1) * 25}px`,
                        backgroundColor: disk.color,
                        bottom: `${diskIndex * 35 + 30}px`,
                        zIndex: diskIndex + 3,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className={styles.screen}>
          <h2 className={styles.title}>Congratulations!</h2>
          <div className={styles.winStats}>
            <p>Moves: {moves}</p>
            <p>Time: {formatTime(time)}</p>
            <p>Minimum possible moves: {minMoves}</p>
          </div>
          <div className={styles.winButtons}>
            <button className={styles.button} onClick={initializeGame}>Play Again</button>
            <button 
              className={styles.button} 
              onClick={() => navigate('/game14')}
            >
              Next Level
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TowerOfHanoi;