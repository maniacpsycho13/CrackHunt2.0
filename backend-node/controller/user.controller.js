
import { db } from "../lib/db.js";


const levelMap = {
    "U2FsdGVkX19h0OJTzewEyvwm3ZalekY6osoyX4UPihE=": "level-1",
    "U2FsdGVkX19Ym1HqbKbTYtP/7Qha4oFeWFFOAED+lfY=": "level-2",
    "U2FsdGVkX19X8AgjmZXHTTAxx8WmY16XhOzfhkKuZQg=": "level-3",
    "U2FsdGVkX1/BaFqXY5RogZE8s2hWKK0mtcWWWkKkl+k=": "level-4",
    "U2FsdGVkX1+qtDPNoCKwJj2RMgNdV3JCpf4g1tDwfNc=": "level-5",
    "U2FsdGVkX19Atq5pkqUsHa5o9DKJHd13bmTE9gofyCA=": "level-6",
    "U2FsdGVkX1/JalJ/QXqnnYg6gBaj/LI6zj1gvFzVCqA=": "level-7",
    "U2FsdGVkX19Wn+W4Ww3lvj29uK0tjrMWdDEFQX7bw0M=": "level-8",
    "U2FsdGVkX19pwedNZi7F5CRK7IJwAtFgDZcdwfiJY3g=": "level-9",
    "U2FsdGVkX1+4Ooh9YhajOqCbktiFEPIqQdgrZzAqxcI=": "level-10",
    "U2FsdGVkX1/R2QhFwFrozwUkF+IqSTCuUjd6e6OwSS4=": "level-11",
    "U2FsdGVkX19sdxjVkiTqX1jW1OMDr7mVnsZMQbZc7VU=": "level-12",
    "U2FsdGVkX1876ZiiLaa5/rjR82WM79rhtBtDQtbgLWM=": "level-13",
    "U2FsdGVkX1+jJk+jYOu65+Hawma31s0dbyt8zvPd7Zc=": "level-14",
    "U2FsdGVkX19iNvYczFgdUVprgKKoEPN/vyyZ/Fwebb0=": "level-15",
    "U2FsdGVkX1/KY9pGX+yXzyOSJvYhbfAL3ebFu0+ME3Y=": "level-16"
};


export const updateScore = async (req, res) => {
    try {
        console.log("Updating score");
        console.log("Request body:", req.body);
        
        const { userId } = req;
        const { level_completed, completion_time , score } = req.body;
        console.log("User ID:", userId);
        console.log("Level Completed:", level_completed);
        console.log("Completion Time:", completion_time);
        
        if (!userId) {
            return res.status(400).json({ message: "User not found" });
        }
        if (!level_completed || !completion_time) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const levelIdString = levelMap[level_completed];
        if (!levelIdString) {
            return res.status(400).json({ message: "Invalid level provided" });
        }

        console.log("Decrypted Level:", levelIdString);
        // Check if user exists
        const user = await db.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if level exists
        const level = await db.level.findUnique({
            where: { id: levelIdString }
        });
        if (!level) {
            return res.status(404).json({ message: "Level not found" });
        }

        console.log("User and level found",level);


        const score1=level.levelNumber*1000-Math.abs(completion_time);
        console.log("Score:",score1);

        // Update or create user progress
        const progress = await db.userLevelProgress.upsert({
            where: { userId_levelId: { userId, levelId: levelIdString } },
            update: { completedTime: score1 },
            create: {
                userId,
                levelId: levelIdString,
                completedTime: score1
            }
        });

        return res.status(200).json({ message: "Score updated successfully", progress });
    } catch (error) {
        console.error("Error updating score:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await db.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                progress: {
                    select: {
                        completedTime: true // This stores the score
                    }
                }
            }
        });

        // Process leaderboard data
        const leaderboardData = leaderboard.map(user => {
            const totalScore = user.progress.reduce((acc, level) => acc + (level.completedTime || 0), 0); // Sum of all scores

            return {
                id: user.id,
                username: user.username,
                name: user.name,
                totalScore
            };
        });

        // Sort by total score in descending order
        leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

        return res.status(200).json({ leaderboard: leaderboardData });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getUserProgress = async (req,res) => {

    try {
        const { userId } = req;
        console.log("Fetching user progress");
        console.log("User ID:", userId);
        
        const completedLevels = await db.userLevelProgress.count({
            where: { userId, completedTime: { not: null } }
        });
        console.log("Completed Levels:", completedLevels);
        
        return res.status(200).json({ completedLevels });
    } catch (error) {
        console.error("Error fetching user progress:", error);
        throw new Error("Internal server error");
    }
}

