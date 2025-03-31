import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./game2.module.css";
import axios from "axios";

const GRID_SIZE = 10;
const MINE_COUNT = 15;

const generateGrid = () => {
    let grid = Array(GRID_SIZE).fill().map(() =>
        Array(GRID_SIZE).fill({
            isMine: false,
            revealed: false,
            flagged: false,
            adjacentMines: 0,
        })
    );

    let minePositions = new Set();
    while (minePositions.size < MINE_COUNT) {
        let row = Math.floor(Math.random() * GRID_SIZE);
        let col = Math.floor(Math.random() * GRID_SIZE);
        minePositions.add(`${row},${col}`);
    }

    minePositions.forEach((pos) => {
        let [row, col] = pos.split(",").map(Number);
        grid[row][col] = { ...grid[row][col], isMine: true };
    });

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (!grid[row][col].isMine) {
                grid[row][col] = { ...grid[row][col], adjacentMines: countAdjacentMines(grid, row, col) };
            }
        }
    }

    return grid;
};

const countAdjacentMines = (grid, row, col) => {
    let count = 0;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    directions.forEach(([dr, dc]) => {
        let newRow = row + dr, newCol = col + dc;
        if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
            if (grid[newRow][newCol].isMine) count++;
        }
    });
    return count;
};

const Minesweeper = () => {
    const [grid, setGrid] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const navigate = useNavigate();
    const currentLevel = 'level-2'; // Set this based on the current game level

    useEffect(() => {
        setGrid(generateGrid());
        setStartTime(Date.now());
    }, []);

    const updateUserScore = async () => {
        const endTime = Date.now();
        const completionTime = Math.floor((endTime - startTime) / 1000); // Convert to seconds
        
        try {
            const token = localStorage.getItem('accessToken'); // Assuming you store JWT in localStorage
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
        if (gameWon) {
            // Update score in the backend
            updateUserScore().then(success => {
                // Navigate to next level after 2 seconds
                const timer = setTimeout(() => {
                    navigate("/game/3");
                }, 2000);
                return () => clearTimeout(timer);
            });
        }
    }, [gameWon, navigate]);

    const restartGame = () => {
        setGrid(generateGrid());
        setGameOver(false);
        setGameWon(false);
        setStartTime(Date.now());
    };

    const revealCell = (row, col) => {
        if (gameOver || gameWon || grid[row][col].revealed || grid[row][col].flagged) return;

        let newGrid = [...grid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = { ...newGrid[row][col], revealed: true };

        if (newGrid[row][col].isMine) {
            setGameOver(true);
            setGrid(newGrid);
            return;
        }

        if (newGrid[row][col].adjacentMines === 0) {
            floodFill(newGrid, row, col);
        }

        setGrid(newGrid);
        checkWin(newGrid);
    };

    const floodFill = (newGrid, row, col) => {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],         [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        directions.forEach(([dr, dc]) => {
            let newRow = row + dr, newCol = col + dc;
            if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
                if (!newGrid[newRow][newCol].revealed && !newGrid[newRow][newCol].isMine) {
                    newGrid[newRow] = [...newGrid[newRow]];
                    newGrid[newRow][newCol] = { ...newGrid[newRow][newCol], revealed: true };
                    if (newGrid[newRow][newCol].adjacentMines === 0) {
                        floodFill(newGrid, newRow, newCol);
                    }
                }
            }
        });
    };

    const toggleFlag = (e, row, col) => {
        e.preventDefault();
        if (gameOver || gameWon || grid[row][col].revealed) return;

        let newGrid = [...grid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = { ...newGrid[row][col], flagged: !newGrid[row][col].flagged };

        setGrid(newGrid);
        checkWin(newGrid);
    };

    const checkWin = (grid) => {
        let revealedCells = 0;
        let correctlyFlagged = 0;

        grid.forEach(row => {
            row.forEach(cell => {
                if (cell.revealed) revealedCells++;
                if (cell.flagged && cell.isMine) correctlyFlagged++;
            });
        });

        if (revealedCells === GRID_SIZE * GRID_SIZE - MINE_COUNT || correctlyFlagged === MINE_COUNT) {
            setGameWon(true);
        }
    };

    return (
        <div className={styles.minesweeperContainer}>
            <h2>Minesweeper</h2>
            <div className={styles.grid}>
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`${styles.cell} ${cell.revealed ? styles.revealed : ""} ${cell.flagged ? styles.flag : ""}`}
                            onClick={() => revealCell(rowIndex, colIndex)}
                            onContextMenu={(e) => toggleFlag(e, rowIndex, colIndex)}
                        >
                            {cell.revealed && cell.isMine ? "💣" : ""}
                            {cell.revealed && !cell.isMine && cell.adjacentMines > 0 ? cell.adjacentMines : ""}
                            {cell.flagged ? "🚩" : ""}
                        </div>
                    ))
                )}
            </div>
            <button className={styles.restartBtn} onClick={restartGame}>Restart</button>
            {gameOver && <div className={styles.gameOver}>Game Over! 💀</div>}
            {gameWon && <div className={styles.gameWon}>🎉 You Won! Moving to Level 3...</div>}
        </div>
    );
};

export default Minesweeper;