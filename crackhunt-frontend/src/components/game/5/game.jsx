import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./game5.module.css";
import axios from "axios";

// Game Constants
const GRAVITY = -0.1;
const JUMP_STRENGTH = -5;
const DESCEND_STRENGTH = -2;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const PIPE_SPEED = 2;
const BIRD_X_POSITION = 100;
const GAME_HEIGHT = 600;
const GAME_WIDTH = 800;
const WIN_SCORE = 15;

const FlappyBird = () => {
    const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
    const [pipes, setPipes] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const navigate = useNavigate();
    const gameLoopRef = useRef(null);
    const currentLevel = 'level-5'; // Set this based on the current game level

    const gameStateRef = useRef({
        birdY: GAME_HEIGHT / 2,
        velocity: 0,
        pipes: [],
        score: 0,
        scoredPipes: new Set()
    });

    const updateUserScore = async () => {
        const endTime = Date.now();
        const completionTime = Math.floor((endTime - startTime) / 1000); // Convert to seconds
        
        try {
            const token = localStorage.getItem('accessToken');
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
        const handleKeyDown = (event) => {
            if (!gameOver && !gameWon) {
                if (event.code === "ArrowUp") {
                    gameStateRef.current.velocity = -JUMP_STRENGTH;
                } else if (event.code === "ArrowDown") {
                    gameStateRef.current.velocity += DESCEND_STRENGTH;
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [gameOver, gameWon]);

    useEffect(() => {
        resetGame();
    }, []);

    useEffect(() => {
        if (!gameOver && !gameWon) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [gameOver, gameWon]);

    const gameLoop = () => {
        const gs = gameStateRef.current;
        gs.birdY = Math.max(0, Math.min(gs.birdY + gs.velocity, GAME_HEIGHT - 30));
        gs.velocity += GRAVITY;
        gs.pipes = gs.pipes.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED })).filter(pipe => pipe.x + PIPE_WIDTH > 0);

        if (gs.pipes.length === 0 || gs.pipes[gs.pipes.length - 1].x < GAME_WIDTH - 300) {
            const topHeight = Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP - 100)) + 50;
            const bottomHeight = GAME_HEIGHT - PIPE_GAP - topHeight;
            gs.pipes.push({ x: GAME_WIDTH, topHeight, bottomHeight, id: Date.now() });
        }

        checkCollision(gs);
        checkScore(gs);

        setBirdY(gs.birdY);
        setPipes([...gs.pipes]);
        setScore(gs.score);

        if (!gameOver && !gameWon) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const checkCollision = (gs) => {
        if (gs.birdY >= GAME_HEIGHT - 30) {
            endGame();
            return;
        }
        for (const pipe of gs.pipes) {
            if (BIRD_X_POSITION + 30 > pipe.x && BIRD_X_POSITION < pipe.x + PIPE_WIDTH &&
                (gs.birdY < pipe.topHeight || gs.birdY + 30 > GAME_HEIGHT - pipe.bottomHeight)) {
                endGame();
                return;
            }
        }
    };

    const checkScore = (gs) => {
        for (const pipe of gs.pipes) {
            if (!gs.scoredPipes.has(pipe.id) && pipe.x + PIPE_WIDTH < BIRD_X_POSITION) {
                gs.score++;
                gs.scoredPipes.add(pipe.id);
                if (gs.score >= WIN_SCORE) {
                    setGameWon(true);
                    updateUserScore().then(() => {
                        setTimeout(() => navigate("/game/level6"), 2000);
                    });
                }
            }
        }
    };

    const endGame = () => {
        setGameOver(true);
        cancelAnimationFrame(gameLoopRef.current);
    };

    const resetGame = () => {
        gameStateRef.current = {
            birdY: GAME_HEIGHT / 2,
            velocity: 0,
            pipes: [],
            score: 0,
            scoredPipes: new Set()
        };
        setBirdY(GAME_HEIGHT / 2);
        setPipes([]);
        setScore(0);
        setGameOver(false);
        setGameWon(false);
        setStartTime(Date.now());
        if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
        }
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    return (
        <div className={styles.gameWrapper}>
            <div className={styles.gameContainer}>
                <h2>Flappy Bird</h2>
                <div className={styles.gameArea} style={{ height: GAME_HEIGHT, width: GAME_WIDTH }}>
                    <div className={styles.bird} style={{ top: birdY, left: BIRD_X_POSITION }}></div>
                    {pipes.map((pipe) => (
                        <React.Fragment key={pipe.id}>
                            <div className={styles.pipeTop} style={{ height: pipe.topHeight, left: pipe.x }} />
                            <div className={styles.pipeBottom} style={{ height: pipe.bottomHeight, left: pipe.x, top: GAME_HEIGHT - pipe.bottomHeight }} />
                        </React.Fragment>
                    ))}
                </div>
                <p className={styles.score}>Score: {score}</p>
                {(gameOver || gameWon) && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h3>{gameWon ? "You Win! 🎉" : "You Lose!"}</h3>
                            <p>Your score: {score}</p>
                            <button onClick={resetGame} className={styles.restartBtn}>Restart Game</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlappyBird;