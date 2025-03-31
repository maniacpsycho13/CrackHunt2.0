import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './game9.module.css';
import axios from 'axios'; // Add this import

const MazeGame = () => {
  const [maze, setMaze] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [gameWon, setGameWon] = useState(false);
  const [shortestPath, setShortestPath] = useState([]);
  const [showShortestPath, setShowShortestPath] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [moves, setMoves] = useState(0);
  const mazeWidth = 21;
  const mazeHeight = 21;
  const navigate = useNavigate();
  const currentLevel = 'level-9';

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

  // Generate maze using recursive backtracking
  const generateMaze = useCallback(() => {
    // Initialize grid with walls (1 = wall, 0 = path)
    let grid = Array(mazeHeight).fill().map(() => Array(mazeWidth).fill(1));
    
    // Carve out paths
    function carve(x, y) {
      grid[y][x] = 0;
      
      // Directions in random order
      const directions = [
        [1, 0], [-1, 0], [0, 1], [0, -1]
      ].sort(() => Math.random() - 0.5);
      
      for (const [dx, dy] of directions) {
        const nx = x + dx * 2, ny = y + dy * 2;
        
        if (nx > 0 && nx < mazeWidth - 1 && ny > 0 && ny < mazeHeight - 1 && grid[ny][nx] === 1) {
          grid[y + dy][x + dx] = 0; // Remove wall between current and next cell
          carve(nx, ny);
        }
      }
    }
    
    // Start carving from (1,1)
    carve(1, 1);
    
    // Set start and end positions
    grid[1][1] = 0; // Start
    grid[mazeHeight - 2][mazeWidth - 2] = 2; // End (2 represents the goal)
    
    return grid;
  }, [mazeWidth, mazeHeight]);

  // Find shortest path using BFS
  const findShortestPath = useCallback((maze, start, end) => {
    const queue = [{ pos: start, path: [start] }];
    const visited = new Set([`${start.x},${start.y}`]);
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    while (queue.length > 0) {
      const { pos, path } = queue.shift();
      
      // Check if we've reached the end
      if (pos.x === end.x && pos.y === end.y) {
        return path;
      }
      
      // Explore neighbors
      for (const [dx, dy] of directions) {
        const nx = pos.x + dx;
        const ny = pos.y + dy;
        
        // Check boundaries and if it's a path (0) or goal (2) and not visited
        if (ny >= 0 && ny < maze.length && nx >= 0 && nx < maze[0].length && 
            (maze[ny][nx] === 0 || maze[ny][nx] === 2) && 
            !visited.has(`${nx},${ny}`)) {
          visited.add(`${nx},${ny}`);
          queue.push({ 
            pos: { x: nx, y: ny }, 
            path: [...path, { x: nx, y: ny }] 
          });
        }
      }
    }
    
    return []; // No path found
  }, []);

  // Initialize game
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    setGameWon(false);
    setShortestPath([]);
    setShowShortestPath(false);
    setStartTime(Date.now());
    setMoves(0);
  };

  // Update shortest path when player moves or maze changes
  useEffect(() => {
    if (maze.length > 0) {
      const path = findShortestPath(maze, playerPos, { x: mazeWidth - 2, y: mazeHeight - 2 });
      setShortestPath(path);
    }
  }, [maze, playerPos, findShortestPath, mazeWidth, mazeHeight]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameWon) return;
      
      let newX = playerPos.x;
      let newY = playerPos.y;
      
      switch (e.key) {
        case 'ArrowUp':
          newY -= 1;
          break;
        case 'ArrowDown':
          newY += 1;
          break;
        case 'ArrowLeft':
          newX -= 1;
          break;
        case 'ArrowRight':
          newX += 1;
          break;
        default:
          return;
      }
      
      // Check if move is valid (within bounds and not a wall)
      if (newY >= 0 && newY < maze.length && newX >= 0 && newX < maze[0].length) {
        if (maze[newY][newX] === 0 || maze[newY][newX] === 2) {
          setPlayerPos({ x: newX, y: newY });
          setMoves(prevMoves => prevMoves + 1);
          
          // Check if reached the end
          if (maze[newY][newX] === 2) {
            setGameWon(true);
            updateUserScore().then(() => {
              setTimeout(() => navigate('/game/10'), 2000);
            });
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, maze, gameWon, navigate]);

  // Render maze cell
  const renderCell = (cell, rowIndex, colIndex) => {
    const isPlayer = playerPos.x === colIndex && playerPos.y === rowIndex;
    const isGoal = cell === 2 && !isPlayer;
    const isOnPath = showShortestPath && shortestPath.some(p => p.x === colIndex && p.y === rowIndex);
    const isStart = rowIndex === 1 && colIndex === 1 && !isPlayer;
    
    let cellClass = styles.cell;
    if (cell === 1) cellClass += ` ${styles.wall}`;
    if (isGoal) cellClass += ` ${styles.goal}`;
    if (isPlayer) cellClass += ` ${styles.player}`;
    if (isOnPath) cellClass += ` ${styles.path}`;
    if (isStart) cellClass += ` ${styles.start}`;
    
    return (
      <div 
        key={`${rowIndex}-${colIndex}`} 
        className={cellClass}
        style={{ 
          width: `calc(100% / ${mazeWidth})`,
          height: `calc(100% / ${mazeHeight})`
        }}
      />
    );
  };

  return (
    <div className={styles.mazeGame}>
      <h1>Maze Pathfinder</h1>
      <div className={styles.controls}>
        <button onClick={resetGame}>New Maze</button>
        <span>Moves: {moves}</span>
      </div>
      
      <div className={styles.instructions}>
        <p>Use arrow keys to move. Find the shortest path to the goal!</p>
      </div>
      
      <div className={styles.mazeContainer}>
        <div className={styles.maze}>
          {maze.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
            </div>
          ))}
        </div>
      </div>
      
      {gameWon && (
        <div className={styles.winMessage}>
          <h2>You Won!</h2>
          <p>You found the exit!</p>
          <p>Total Moves: {moves}</p>
          <p>Proceeding to Level 10...</p>
          <button onClick={resetGame}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default MazeGame;