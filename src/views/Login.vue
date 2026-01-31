<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="gradient-text">智能校园活动管理系统</h1>
      <p class="subtitle">AI驱动的校园活动平台</p>

      <el-form :model="form" class="login-form">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleLogin" style="width: 100%;">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-link">
        <span>还没有账号？</span>
        <router-link to="/register" class="link">立即注册</router-link>
      </div>

      <div class="demo-accounts">
        <el-divider>演示账号</el-divider>
        <div style="font-size: 14px; color: #666; line-height: 1.8;">
          <p><strong>管理员账号:</strong> admin / 123456</p>
          <p style="margin-top: 10px; font-size: 13px; color: #909399;">
            学生账号可以在注册页面自行注册
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const result = await userStore.login(form)
    if (result.success) {
      ElMessage.success('登录成功！')
      router.push('/home')
    } else {
      ElMessage.error(result.message || '用户名或密码错误')
    }
  } catch (error) {
    ElMessage.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 450px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
  text-align: center;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 30px;
}

.demo-accounts {
  margin-top: 30px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #64748b;
  font-size: 14px;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
}

.link:hover {
  color: #764ba2;
}
</style>
