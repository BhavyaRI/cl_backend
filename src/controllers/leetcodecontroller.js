const { LeetCode } = require("leetcode-query");
const redisClient = require('../config/redisClient'); 

const CACHE_EXPIRATION_SECONDS = 3600; // Cache for 1 hour

const getUserData = async (req, res) => {
  try {
    const username = req.params.userId;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    
    const cacheKey = `leetcode:${username}`;

    //Check the cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.send(JSON.parse(cachedData));
    }

    //no cache then direct api
    const leetcode = new LeetCode();
    const user = await leetcode.user(username);

    if (!user.matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const userProfile = {
      username: user.matchedUser.username,
      realName: user.matchedUser.profile.realName,
      ranking: user.matchedUser.profile.ranking,
      avatar: user.matchedUser.profile.userAvatar,
      github: user.matchedUser.profile.githubUrl,
      linkedin: user.matchedUser.profile.linkedinUrl,
    };

    const solvedStats = {
      totalSolved: user.matchedUser.submitStats.acSubmissionNum[0].count,
      easySolved: user.matchedUser.submitStats.acSubmissionNum[1].count,
      mediumSolved: user.matchedUser.submitStats.acSubmissionNum[2].count,
      hardSolved: user.matchedUser.submitStats.acSubmissionNum[3].count,
    };

    const contestProfile = {
      attended: user.matchedUser.profile.attendedContestsCount,
      rating: user.matchedUser.contestRanking?.rating,
      globalRanking: user.matchedUser.contestRanking?.globalRanking,
      topPercentage: user.matchedUser.contestRanking?.topPercentage,
    };

    const badges = user.matchedUser.badges.map((badge) => ({
      id: badge.id,
      name: badge.displayName,
      icon: badge.icon,
      creationDate: new Date(badge.creationDate * 1000).toLocaleDateString(),
    }));

    const leetData = {
      userProfile,
      solvedStats,
      contestProfile,
      badges,
    };

    //Store the new data in Redis with an expiration time
    await redisClient.setEx(cacheKey, CACHE_EXPIRATION_SECONDS, JSON.stringify(leetData));

    res.send(leetData);

  } catch (error) {
    // Check if the error is a 'User not found' type error from the leetcode-query library
    if (error.message && error.message.includes("User not found")) {
        return res.status(404).json({
            status: 'FAILED',
            message: 'User not found'
        });
    }
    return res.status(500).json({
      status: 'FAILED',
      message: error.message,
    });
  }
};

module.exports = { getUserData };