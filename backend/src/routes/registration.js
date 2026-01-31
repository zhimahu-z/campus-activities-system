const express = require('express')
const router = express.Router()
const registrationController = require('../controllers/registrationController')
const auth = require('../middleware/auth')
const { isAdmin } = require('../middleware/permission')

// 需要认证的路由
router.post('/', auth, registrationController.registerActivity)
router.delete('/:activityId', auth, registrationController.cancelRegistration)
router.get('/user/:userId?', auth, registrationController.getUserRegistrations)
router.get('/activity/:activityId', auth, registrationController.getActivityRegistrations)

// 管理员路由
router.get('/stats/all', auth, isAdmin, registrationController.getAllRegistrationsStats)

module.exports = router




