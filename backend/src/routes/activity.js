const express = require('express')
const router = express.Router()
const activityController = require('../controllers/activityController')
const auth = require('../middleware/auth')
const { isAdmin } = require('../middleware/permission')

// 公开路由
router.get('/', activityController.getAllActivities)
router.get('/statistics', activityController.getStatistics)
router.get('/:id', activityController.getActivityById)

// 需要管理员权限的路由
router.post('/', auth, isAdmin, activityController.createActivity)
router.put('/:id', auth, isAdmin, activityController.updateActivity)
router.delete('/:id', auth, isAdmin, activityController.deleteActivity)

module.exports = router




