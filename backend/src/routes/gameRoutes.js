const express = require('express');
const {
  getGames,
  getGame,
  getFeaturedGames,
  getWeeklyDiscounts,
  getBestsellers,
  getGamesByCategory
} = require('../controllers/gameController');

const router = express.Router();

router.route('/').get(getGames);
router.route('/featured').get(getFeaturedGames);
router.route('/discounts').get(getWeeklyDiscounts);
router.route('/bestsellers').get(getBestsellers);
router.route('/category/:categoryId').get(getGamesByCategory);
router.route('/:id').get(getGame);

module.exports = router;