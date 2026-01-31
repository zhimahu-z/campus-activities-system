const express = require('express')
const router = express.Router()
const favoriteController = require('../controllers/favoriteController')
const auth = require('../middleware/auth')

// 需要认证的路由
router.post('/', auth, favoriteController.addFavorite)
router.delete('/:activityId', auth, favoriteController.removeFavorite)
router.get('/user/:userId?', auth, favoriteController.getUserFavorites)
router.get('/check/:activityId', auth, favoriteController.checkFavorite)

module.exports = router




