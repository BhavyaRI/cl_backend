const express = require('express');
const router = express.Router();
const codeforcescontroller = require('../controllers/codeforcescontroller');
const leetcodecontroller = require('../controllers/leetcodecontroller');

router.get('/:userId',codeforcescontroller.getUserinfo);
router.get('/contests/upcoming',codeforcescontroller.upcomingcontest);
router.get('/leetcode/:userId',leetcodecontroller.getUserData);

module.exports = router;