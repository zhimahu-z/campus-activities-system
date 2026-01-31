const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const auth = require('../middleware/auth')
const { isAdmin } = require('../middleware/permission')
const { body } = require('express-validator')

// 注册验证规则
const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度在3-50个字符'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
  body('name').trim().notEmpty().withMessage('姓名不能为空'),
  body('email').isEmail().withMessage('邮箱格式不正确')
]

// 公开路由
router.post('/register', registerValidation, userController.register)
router.post('/login', userController.login)

// 需要认证的路由
router.get('/me', auth, userController.getCurrentUser)
router.put('/me', auth, userController.updateUser)
router.post('/change-password', auth, userController.changePassword)

// 管理员路由
router.get('/students', auth, isAdmin, userController.getAllStudents)
router.get('/:id', auth, userController.getUserById)
router.post('/', auth, isAdmin, userController.createUser)
router.put('/:id', auth, isAdmin, userController.updateUser)
router.delete('/:id', auth, isAdmin, userController.deleteUser)

module.exports = router




