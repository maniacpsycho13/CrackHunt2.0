
import { db } from "../lib/db.js";


export const updateScore = async (req, res) => {
    try {
        console.log("Updating score");
        console.log("Request body:", req.body);
        
        const { userId } = req;
        const { level_completed, completion_time } = req.body;
        console.log("User ID:", userId);
        console.log("Level Completed:", level_completed);
        console.log("Completion Time:", completion_time);
        
        if (!userId) {
            return res.status(400).json({ message: "User not found" });
        }
        if (!level_completed || !completion_time) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists
        const user = await db.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if level exists
        const level = await db.level.findUnique({
            where: { id: level_completed }
        });
        if (!level) {
            return res.status(404).json({ message: "Level not found" });
        }

        console.log("User and level found",level);


        const score=level.levelNumber*100-completion_time;
        console.log("Score:",score);

        // Update or create user progress
        const progress = await db.userLevelProgress.upsert({
            where: { userId_levelId: { userId, levelId: level_completed } },
            update: { completedTime: score },
            create: {
                userId,
                levelId: level_completed,
                completedTime: completion_time
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

