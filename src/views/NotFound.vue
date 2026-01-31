<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>页面不存在</h1>
      <p>抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" size="large" @click="router.push('/home')">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.not-found-content {
  text-align: center;
  color: white;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  margin-bottom: 20px;
  opacity: 0.8;
}

h1 {
  font-size: 36px;
  margin-bottom: 15px;
}

p {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
}
</style>




