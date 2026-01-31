const express = require('express')
const router = express.Router()
const commentController = require('../controllers/commentController')
const auth = require('../middleware/auth')

// 公开路由
router.get('/activity/:activityId', commentController.getActivityComments)

// 需要认证的路由
router.post('/', auth, commentController.createComment)
router.delete('/:id', auth, commentController.deleteComment)

module.exports = router




