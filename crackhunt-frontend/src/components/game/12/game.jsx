import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./game12.module.css";
import axios from 'axios';
const words = [
    'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again',
    'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alien', 'allow', 'alone', 'alter',
    'among', 'anger', 'angle', 'angry', 'apart', 'apple', 'apply', 'argue', 'arise', 'array',
    'aside', 'asset', 'audio', 'audit', 'avoid', 'award', 'aware', 'badly', 'baker', 'bases',
    'basic', 'basis', 'beach', 'began', 'begin', 'begun', 'being', 'below', 'bench', 'birth',
    'black', 'blame', 'blind', 'block', 'blood', 'board', 'brain', 'brand', 'bread', 'break',
    'breed', 'brief', 'bring', 'broad', 'broke', 'brown', 'build', 'built', 'catch', 'cause',
    'chain', 'chair', 'chart', 'check', 'chief', 'child', 'china', 'choir', 'civil', 'claim',
    'class', 'clean', 'clear', 'climb', 'clock', 'close', 'coach', 'coach', 'coast', 'could',
    'count', 'court', 'cover', 'craft', 'crash', 'cream', 'crime', 'cross', 'crowd', 'crown',
    'curve', 'cycle', 'daily', 'dance', 'dated', 'dealt', 'death', 'debut', 'delay', 'depth',
    'doing', 'doubt', 'dozen', 'draft', 'drama', 'drawn', 'dream', 'dress', 'drill', 'drink',
    'drive', 'dying', 'eager', 'early', 'earth', 'eight', 'elite', 'enemy', 'enjoy', 'enter',
    'entry', 'equal', 'error', 'event', 'every', 'exact', 'exist', 'extra', 'faith', 'false',
    'fault', 'favor', 'fever', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'final', 'first',
    'fixed', 'flash', 'fleet', 'floor', 'focus', 'force', 'forge', 'forth', 'forty', 'forum',
    'found', 'frame', 'frank', 'fraud', 'fresh', 'front', 'fruit', 'fully', 'funny', 'giant',
    'given', 'glass', 'globe', 'going', 'grace', 'grade', 'grand', 'grant', 'grass', 'great',
    'green', 'gross', 'group', 'grown', 'guard', 'guess', 'guest', 'guide', 'happy', 'harry',
    'heart', 'heavy', 'hence', 'henry', 'horse', 'hotel', 'house', 'human', 'ideal', 'image',
    'index', 'inner', 'input', 'issue', 'japan', 'jimmy', 'joint', 'jones', 'judge', 'known',
    'label', 'large', 'laser', 'later', 'laugh', 'layer', 'learn', 'lease', 'least', 'leave',
    'legal', 'level', 'lewis', 'light', 'limit', 'links', 'lives', 'local', 'logic', 'loose',
    'lower', 'lucky', 'lunch', 'lying', 'magic', 'major', 'maker', 'march', 'maria', 'match',
    'maybe', 'mayor', 'meant', 'media', 'metal', 'might', 'minor', 'minus', 'mixed', 'model',
    'money', 'month', 'moral', 'motor', 'mount', 'mouse', 'mouth', 'movie', 'music', 'needs',
    'nerve', 'never', 'newly', 'night', 'noise', 'north', 'noted', 'novel', 'nurse', 'occur',
    'ocean', 'offer', 'often', 'order', 'other', 'ought', 'paint', 'panel', 'paper', 'party',
    'peace', 'peter', 'phase', 'phone', 'photo', 'piece', 'pilot', 'pitch', 'place', 'plain',
    'plane', 'plant', 'plate', 'point', 'pound', 'power', 'press', 'price', 'pride', 'prime',
    'print', 'prior', 'prize', 'proof', 'proud', 'prove', 'queen', 'quick', 'quiet', 'quite',
    'radio', 'raise', 'reach', 'ready', 'refer', 'right', 'rival', 'river', 'robot', 'roger',
    'roman', 'rough', 'round', 'route', 'royal', 'rural', 'scale', 'scene', 'scope', 'score',
    'sense', 'serve', 'seven', 'shall', 'shape', 'share', 'sharp', 'sheet', 'shelf', 'shell',
    'shift', 'shirt', 'shock', 'shoot', 'shore', 'short', 'shown', 'sight', 'since', 'sixth',
    'sixty', 'sized', 'skill', 'sleep', 'slide', 'small', 'smart', 'smile', 'smith', 'smoke',
    'solid', 'solve', 'sorry', 'sound', 'south', 'space', 'spare', 'speak', 'speed', 'spend',
    'spent', 'split', 'spoke', 'sport', 'staff', 'stage', 'stake', 'stand', 'start', 'state',
    'steam', 'steel', 'stick', 'still', 'stock', 'stone', 'stood', 'store', 'storm', 'story',
    'strip', 'stuck', 'study', 'stuff', 'style', 'sugar', 'suite', 'super', 'sweet', 'table',
    'taken', 'taste', 'taxes', 'teach', 'teeth', 'terry', 'texas', 'thank', 'theft', 'their',
    'theme', 'there', 'these', 'thick', 'thing', 'think', 'third', 'those', 'three', 'threw',
    'throw', 'tight', 'times', 'tired', 'title', 'today', 'topic', 'total', 'touch', 'tough',
    'tower', 'track', 'trade', 'train', 'treat', 'trend', 'trial', 'tried', 'tries', 'truck',
    'truly', 'trust', 'truth', 'twice', 'under', 'undue', 'union', 'unity', 'until', 'upper',
    'upset', 'urban', 'usage', 'usual', 'vague', 'valid', 'value', 'video', 'visit', 'vital',
    'voice', 'virus', 'waste', 'watch', 'water', 'wheel', 'where', 'which', 'while', 'white',
    'whole', 'whose', 'woman', 'women', 'world', 'worry', 'worse', 'worst', 'worth', 'would',
    'wound', 'write', 'wrong', 'wrote', 'yield', 'young', 'youth'
];


// ... (words array remains the same)

const WordGuessing = () => {
    const wordLength = 5;
    const maxAttempts = 6;
    const navigate = useNavigate();
    const currentLevel = 'level-12';
    
    const [word, setWord] = useState(() =>
        words[Math.floor(Math.random() * words.length)].toUpperCase()
    );

    const [grid, setGrid] = useState(() =>
        Array(maxAttempts).fill("").map(() => Array(wordLength).fill(""))
    );

    const [currentRow, setCurrentRow] = useState(0);
    const [currentCol, setCurrentCol] = useState(0);
    const [message, setMessage] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const [startTime, setStartTime] = useState(Date.now());
    const [attempts, setAttempts] = useState(0);
    const [rowStatuses, setRowStatuses] = useState(() =>
        Array(maxAttempts).fill().map(() => Array(wordLength).fill(""))
    );

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
                    moves: attempts // Number of attempts
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

    const checkWord = useCallback((guessedWord) => {
        // ... (previous implementation remains the same)
    }, [word]);

    const handleKeyPress = useCallback((key) => {
        if (gameOver) return;

        if (message) {
            setMessage("");
        }

        if (key === "ENTER" && currentCol === wordLength) {
            const guessedWord = grid[currentRow].join("").toUpperCase();
            setAttempts(prev => prev + 1);

            const wordStatus = checkWord(guessedWord);

            setRowStatuses(prevStatuses => {
                const newStatuses = [...prevStatuses];
                newStatuses[currentRow] = wordStatus;
                return newStatuses;
            });

            if (guessedWord === word) {
                setMessage("🎉 You Win!");
                setGameOver(true);
                updateUserScore().then(() => {
                    setTimeout(() => navigate('/next-level'), 2000);
                });
            } else {
                if (currentRow < maxAttempts - 1) {
                    setCurrentRow(prevRow => prevRow + 1);
                    setCurrentCol(0);
                } else {
                    setMessage(`😢 Game Over! The word was ${word}`);
                    setGameOver(true);
                }
            }
        } else if (key === "BACKSPACE" && currentCol > 0) {
            setGrid(prevGrid => {
                const newGrid = [...prevGrid];
                newGrid[currentRow][currentCol - 1] = "";
                return newGrid;
            });
            setCurrentCol(prevCol => prevCol - 1);
        } else if (/^[A-Z]$/.test(key) && currentCol < wordLength) {
            setGrid(prevGrid => {
                const newGrid = [...prevGrid];
                newGrid[currentRow][currentCol] = key;
                return newGrid;
            });
            setCurrentCol(prevCol => prevCol + 1);
        }
    }, [gameOver, currentCol, currentRow, wordLength, maxAttempts, word, grid, checkWord, message, navigate]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const resetGame = useCallback(() => {
        setWord(words[Math.floor(Math.random() * words.length)].toUpperCase());
        setGrid(Array(maxAttempts).fill("").map(() => Array(wordLength).fill("")));
        setCurrentRow(0);
        setCurrentCol(0);
        setMessage("");
        setGameOver(false);
        setRowStatuses(Array(maxAttempts).fill().map(() => Array(wordLength).fill("")));
        setStartTime(Date.now());
        setAttempts(0);
    }, [maxAttempts, wordLength]);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Word Guessing Game</h2>
            <div className={styles.gameInfo}>
                <span>Attempts: {attempts}</span>
            </div>
            <div className={styles.grid}>
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className={styles.row}>
                        {row.map((letter, colIndex) => {
                            let className = styles.tile;
                            if (rowIndex < currentRow || (rowIndex === currentRow && currentCol === wordLength)) {
                                const status = rowStatuses[rowIndex][colIndex];
                                if (status === "correct") className += ` ${styles.tileCorrect}`;
                                else if (status === "misplaced") className += ` ${styles.tileMisplaced}`;
                                else if (status === "incorrect") className += ` ${styles.tileIncorrect}`;
                            }
                            return <div key={colIndex} className={className}>{letter}</div>;
                        })}
                    </div>
                ))}
            </div>

            <Keyboard onKeyPress={handleKeyPress} />

            {message && <p className={styles.message}>{message}</p>}

            <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={resetGame}>Restart</button>
                {gameOver && (
                    <button 
                        className={styles.button} 
                        onClick={() => {
                            updateUserScore().then(() => {
                                navigate('/next-level');
                            });
                        }}
                    >
                        Next Level
                    </button>
                )}
            </div>
        </div>
    );
};

const Keyboard = React.memo(({ onKeyPress }) => {
    const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

    return (
        <div className={styles.keyboard}>
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className={styles.keyboardRow}>
                    {row.split("").map((letter) => (
                        <button 
                            key={letter} 
                            className={styles.key} 
                            onClick={() => onKeyPress(letter)}
                        >
                            {letter}
                        </button>
                    ))}
                </div>
            ))}
            <div className={styles.keyboardRow}>
                <button 
                    className={`${styles.key} ${styles.enterKey}`} 
                    onClick={() => onKeyPress("ENTER")}
                >
                    ENTER
                </button>
                <button 
                    className={`${styles.key} ${styles.backspaceKey}`} 
                    onClick={() => onKeyPress("BACKSPACE")}
                >
                    ⌫
                </button>
            </div>
        </div>
    );
});

export default WordGuessing;