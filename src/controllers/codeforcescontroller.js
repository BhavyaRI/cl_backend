const axios = require("axios");
const redisClient = require('../config/redisClient');

const CACHE_EXPIRATION_SECONDS = 3600; 

const getUserinfo = async (req, res) => {
  try {
    const user = req.params.userId;
    const cacheKey = `codeforces:${user}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.send(JSON.parse(cachedData));
    }

    const [info, ratingres, statusres] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.info?handles=${user}`),
      axios.get(`https://codeforces.com/api/user.rating?handle=${user}`),
      axios.get(`https://codeforces.com/api/user.status?handle=${user}`),
    ]);

    // This is used for getting graph points for no. of prblms vs rating graphs
    const submissions = statusres.data.result;
    const solvedrating = new Set();
    const graphdata = {};
    for (const rating of submissions) {
      const { problem, verdict } = rating;
      if (verdict === 'OK' && problem.rating) {
        const key = `${problem.contestId}-${problem.index}`;
        if (!solvedrating.has(key)) {
          solvedrating.add(key);
          graphdata[problem.rating] = (graphdata[problem.rating] || 0) + 1;
        }
      }
    }

    //This is for plotting rating vs time graph
    const contestrating = {};
    const ratingdata = ratingres.data.result;
    for (const d of ratingdata) {
      const { ratingUpdateTimeSeconds, newRating } = d;
      contestrating[ratingUpdateTimeSeconds] = newRating;
    }

    //This is for number of prblm solved per tags
    const ptags = {};
    const solvedp = new Set();
    for (const p of submissions) {
      const { problem, verdict } = p;
      if (verdict === 'OK' && (problem.tags.length !== 0)) {
        const key = `${problem.contestId}-${problem.index}`;
        if (!solvedp.has(key)) {
          solvedp.add(key);
          const tags = problem.tags;
          for (const t of tags) {
            ptags[t] = (ptags[t] || 0) + 1;
          }
        }
      }
    }

    const data = {
      info: info.data.result[0],
      ratinggraph: contestrating,
      problemgraph: graphdata,
      tagscount: ptags
    };

    // Store the new data in Redis with an expiration time
    await redisClient.setEx(cacheKey, CACHE_EXPIRATION_SECONDS, JSON.stringify(data));

    res.send(data);
  } catch (error) {
    return res.status(400).json({
      status: 'FAILED',
      message: error.message,
    });
  }
};

const upcomingcontest = async (req, res) => {
  try {
    const cacheKey = 'codeforces:upcoming-contests';
    const CONTEST_CACHE_EXPIRATION = 600; 

    const cachedContests = await redisClient.get(cacheKey);
    if (cachedContests) {
        const contests = JSON.parse(cachedContests);
        return res.json(contests);
    }
    
    const contestsRes = await axios.get("https://codeforces.com/api/contest.list");
    const data = contestsRes.data;

    if (data.status !== 'OK') {
      throw new Error("Failed to fetch contest");
    }

    const upcomingContestsRaw = data.result
      .filter(contest => contest.phase === 'BEFORE')
      .map(contest => ({
          id: contest.id,
          name: contest.name,
          type: contest.type,
          durationSeconds: contest.durationSeconds, 
          startTimeSeconds: contest.startTimeSeconds 
      }));

    await redisClient.setEx(cacheKey, CONTEST_CACHE_EXPIRATION, JSON.stringify(upcomingContestsRaw));

    res.json(upcomingContestsRaw);
  } catch (err) {
    return res.status(400).json({
      status: 'FAILED',
      message: err.message,
    });
  }
}

module.exports = { getUserinfo, upcomingcontest };