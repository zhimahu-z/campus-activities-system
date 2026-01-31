import { defineStore } from 'pinia'
import { ref } from 'vue'
import deepseekService from '@/services/deepseek'

export const useAIStore = defineStore('ai', () => {
  const loading = ref(false)
  const recommendations = ref([])
  const searchEnhancement = ref(null)
  const commentAnalysis = ref(null)
  const dataInsights = ref(null)

  const getRecommendations = async (userBehavior, allActivities) => {
    loading.value = true
    try {
      const recommendedIds = await deepseekService.recommendActivities(userBehavior, allActivities)
      recommendations.value = allActivities.filter(activity => 
        recommendedIds.includes(activity.id.toString()) || recommendedIds.includes(activity.id)
      )
      return recommendations.value
    } catch (error) {
      console.error('AI推荐失败:', error)
      return allActivities.slice(0, 3)
    } finally {
      loading.value = false
    }
  }

  const enhanceSearch = async (query, activities) => {
    loading.value = true
    try {
      const result = await deepseekService.enhanceSearch(query, activities)
      searchEnhancement.value = result
      return result
    } catch (error) {
      console.error('搜索增强失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const analyzeComment = async (comment) => {
    loading.value = true
    try {
      const result = await deepseekService.analyzeComment(comment)
      commentAnalysis.value = result
      return result
    } catch (error) {
      console.error('评论分析失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const extractSummary = async (description) => {
    loading.value = true
    try {
      return await deepseekService.extractSummary(description)
    } catch (error) {
      console.error('摘要提取失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const analyzeData = async (data) => {
    loading.value = true
    try {
      const result = await deepseekService.analyzeData(data)
      dataInsights.value = result
      return result
    } catch (error) {
      console.error('数据分析失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  const generateTitles = async (description) => {
    loading.value = true
    try {
      return await deepseekService.generateTitleSuggestions(description)
    } catch (error) {
      console.error('标题生成失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  const clearCache = () => {
    recommendations.value = []
    searchEnhancement.value = null
    commentAnalysis.value = null
    dataInsights.value = null
  }

  return {
    loading, recommendations, searchEnhancement, commentAnalysis, dataInsights,
    getRecommendations, enhanceSearch, analyzeComment, extractSummary,
    analyzeData, generateTitles, clearCache
  }
})
