<template>
  <div class="create-activity-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>创建活动</span>
          <el-button @click="router.back()">返回</el-button>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入活动标题" />
          <el-button style="margin-top: 10px;" @click="generateTitles" :loading="generatingTitles">
            <el-icon><MagicStick /></el-icon>
            AI生成标题建议
          </el-button>
          <div v-if="titleSuggestions.length > 0" class="suggestions">
            <el-tag
              v-for="(title, index) in titleSuggestions"
              :key="index"
              @click="form.title = title"
              style="cursor: pointer; margin: 5px;"
            >
              {{ title }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="活动分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option
              v-for="cat in activityStore.categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="6"
            placeholder="请输入活动详细描述"
          />
        </el-form-item>

        <el-form-item label="活动标签" prop="tags">
          <el-select v-model="form.tags" multiple placeholder="请选择标签">
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
          />
        </el-form-item>

        <el-form-item label="活动地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入活动地点" />
        </el-form-item>

        <el-form-item label="主办方" prop="organizer">
          <el-input v-model="form.organizer" placeholder="请输入主办方" />
        </el-form-item>

        <el-form-item label="最大人数" prop="maxParticipants">
          <el-input-number v-model="form.maxParticipants" :min="1" />
        </el-form-item>

        <el-form-item label="参与要求" prop="requirements">
          <el-input v-model="form.requirements" placeholder="请输入参与要求" />
        </el-form-item>

        <el-form-item label="活动收益" prop="benefits">
          <el-input v-model="form.benefits" placeholder="请输入活动收益" />
        </el-form-item>

        <el-form-item label="封面图片" prop="cover">
          <el-input v-model="form.cover" placeholder="请输入封面图片URL" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            创建活动
          </el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/stores/activity'
import { useAIStore } from '@/stores/ai'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activityStore = useActivityStore()
const aiStore = useAIStore()

const formRef = ref(null)
const submitting = ref(false)
const generatingTitles = ref(false)
const titleSuggestions = ref([])

const form = ref({
  title: '',
  category: '',
  description: '',
  tags: [],
  startTime: '',
  endTime: '',
  location: '',
  organizer: '',
  maxParticipants: 100,
  requirements: '',
  benefits: '',
  cover: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
})

const rules = {
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  organizer: [{ required: true, message: '请输入主办方', trigger: 'blur' }]
}

const allTags = computed(() => activityStore.getAllTags())

const generateTitles = async () => {
  if (!form.value.description) {
    ElMessage.warning('请先输入活动描述')
    return
  }

  generatingTitles.value = true
  try {
    titleSuggestions.value = await aiStore.generateTitles(form.value.description)
    ElMessage.success('标题建议已生成')
  } catch (error) {
    ElMessage.error('生成失败，请重试')
  } finally {
    generatingTitles.value = false
  }
}

const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const activityData = {
          ...form.value,
          startTime: form.value.startTime.toISOString(),
          endTime: form.value.endTime.toISOString()
        }

        const result = await activityStore.createActivity(activityData)
        if (result.success) {
          ElMessage.success('活动创建成功')
          // 等待一小段时间确保数据已保存
          await new Promise(resolve => setTimeout(resolve, 500))
          // 刷新活动列表
          await activityStore.fetchActivities()
          // 跳转到活动管理页面
          router.push('/admin/activities')
        } else {
          ElMessage.error(result.message || '创建失败')
        }
      } catch (error) {
        console.error('创建活动失败:', error)
        ElMessage.error(error.response?.data?.message || '创建失败，请重试')
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<style scoped>
.create-activity-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestions {
  margin-top: 10px;
}
</style>
