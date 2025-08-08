// Simple point system: 1 point per minute of tracked time.
export const calculatePoints = (seconds: number): number => {
    return Math.floor(seconds / 60);
};

// Leveling system: progressively harder to level up.
export const calculateLevel = (points: number): { level: number; pointsForNextLevel: number; progress: number } => {
    if (points < 0) return { level: 1, pointsForNextLevel: 100, progress: 0 };
    
    let level = 1;
    let requiredPoints = 100; // Points to reach level 2
    let pointsAtLevelStart = 0;

    while (points >= requiredPoints) {
        level++;
        pointsAtLevelStart = requiredPoints;
        requiredPoints += Math.floor(100 * Math.pow(1.15, level - 1));
    }

    const pointsInCurrentLevel = points - pointsAtLevelStart;
    const pointsToNextLevel = requiredPoints - pointsAtLevelStart;
    const progress = pointsToNextLevel > 0 ? (pointsInCurrentLevel / pointsToNextLevel) * 100 : 0;

    return {
        level,
        pointsForNextLevel: requiredPoints,
        progress,
    };
};
