import axios from 'axios'

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com'

// 创建DeepSeek专用axios实例
const deepseekClient = axios.create({
  baseURL: DEEPSEEK_API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
  }
})

class DeepSeekService {
  /**
   * 调用DeepSeek Chat API
   */
  async chat(prompt, systemPrompt = '你是一个智能助手', temperature = 0.7) {
    // 检查API Key是否配置（只检查是否为空，不检查具体值）
    if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === '') {
      console.warn('⚠️ DeepSeek API Key未配置')
      // 对于需要具体数据的场景，抛出错误让调用方处理
      if (prompt.includes('搜索') || prompt.includes('search') || 
          prompt.includes('推荐') || prompt.includes('recommend')) {
        throw new Error('API_KEY_NOT_CONFIGURED')
      }
      return this.localIntelligentMatch(prompt)
    }

    try {
      console.log('🤖 正在调用DeepSeek API...')
      console.log('📝 API Key前缀:', DEEPSEEK_API_KEY.substring(0, 10) + '...')
      
      const response = await deepseekClient.post('/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: 2000,
        stream: false
      })
      
      console.log('✅ DeepSeek API调用成功')
      return response.data.choices[0].message.content
      
    } catch (error) {
      console.error('❌ DeepSeek API调用失败:', error.response?.data || error.message)
      
      // 特殊处理 402 错误
      if (error.response?.status === 402) {
        console.warn('💰 DeepSeek 账户余额不足，请充值')
        console.warn('💡 访问 https://platform.deepseek.com/ 充值')
      } else if (error.response?.status === 401) {
        console.warn('🔑 API Key无效，请检查配置')
      }
      
      // 对于需要具体数据的场景，抛出错误让调用方处理
      if (prompt.includes('搜索') || prompt.includes('search') || 
          prompt.includes('推荐') || prompt.includes('recommend')) {
        throw error
      }
      
      // API调用失败时使用本地智能匹配
      return this.localIntelligentMatch(prompt)
    }
  }

  /**
   * 本地智能匹配（当API不可用时）
   * 注意：此方法仅用于 chat() 方法的降级，不应返回硬编码的活动ID
   */
  localIntelligentMatch(prompt) {
    console.log('💡 使用本地智能匹配算法')
    
    // 对于搜索、推荐等需要具体活动数据的场景
    // 应该抛出错误，让调用方使用自己的降级逻辑
    if (prompt.includes('搜索') || prompt.includes('search') || 
        prompt.includes('推荐') || prompt.includes('recommend')) {
      throw new Error('API不可用，请使用本地算法')
    }
    
    // 评论分析
    if (prompt.includes('评论') || prompt.includes('comment')) {
      const sentiment = this.analyzeSentiment(prompt)
      return JSON.stringify({
        sentiment: sentiment.type,
        sentimentScore: sentiment.score,
        isAppropriate: sentiment.isAppropriate,
        suggestions: sentiment.suggestions,
        tags: sentiment.tags
      })
    }
    
    // 摘要提取
    if (prompt.includes('摘要') || prompt.includes('summary')) {
      return JSON.stringify({
        summary: '这是一个精彩的校园活动，值得参与',
        keywords: ['活动', '校园', '精彩'],
        highlights: ['内容丰富', '互动性强', '收获满满']
      })
    }
    
    // 数据分析
    if (prompt.includes('分析') || prompt.includes('analyze')) {
      return JSON.stringify({
        insights: ['活动参与度较高', '用户活跃度良好', '热门分类集中'],
        trends: ['参与人数呈上升趋势', '周末活动更受欢迎'],
        recommendations: ['增加热门分类活动', '优化活动时间安排', '加强宣传推广'],
        summary: '平台整体运营良好，用户参与度高，建议继续优化活动质量'
      })
    }
    
    return JSON.stringify({ result: 'success' })
  }

  /**
   * 提取关键词
   */
  extractKeywords(text) {
    const keywords = []
    const commonWords = ['人工智能', 'AI', '音乐', '运动', '马拉松', '讲座', '演出', '比赛', '志愿', '创业']
    
    commonWords.forEach(word => {
      if (text.includes(word)) {
        keywords.push(word)
      }
    })
    
    return keywords.length > 0 ? keywords : ['活动']
  }

  /**
   * 猜测分类
   */
  guessCategory(keyword) {
    const categoryMap = {
      '人工智能': '学术讲座',
      'AI': '学术讲座',
      '讲座': '学术讲座',
      '音乐': '文艺演出',
      '演出': '文艺演出',
      '运动': '体育竞技',
      '马拉松': '体育竞技',
      '志愿': '志愿服务',
      '创业': '创新创业'
    }
    
    return categoryMap[keyword] || ''
  }

  /**
   * 情感分析
   */
  analyzeSentiment(text) {
    const positiveWords = ['好', '棒', '赞', '优秀', '精彩', '喜欢', '推荐', '满意']
    const negativeWords = ['差', '烂', '垃圾', '失望', '不好', '糟糕']
    const inappropriateWords = ['骂人', '脏话', '广告', '垃圾信息']
    
    let positiveCount = 0
    let negativeCount = 0
    let hasInappropriate = false
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveCount++
    })
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeCount++
    })
    
    inappropriateWords.forEach(word => {
      if (text.includes(word)) hasInappropriate = true
    })
    
    let sentiment = 'neutral'
    let score = 50
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive'
      score = 70 + Math.min(positiveCount * 10, 30)
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative'
      score = 30 - Math.min(negativeCount * 10, 20)
    }
    
    return {
      type: sentiment,
      score: score,
      isAppropriate: !hasInappropriate,
      suggestions: hasInappropriate ? '评论包含不当内容，请修改后再发表' : '',
      tags: sentiment === 'positive' ? ['积极', '正面'] : sentiment === 'negative' ? ['消极', '负面'] : ['中性']
    }
  }

  /**
   * 智能搜索增强
   */
  async enhanceSearch(query, activities) {
    const systemPrompt = `你是一个智能搜索助手，专门帮助用户在校园活动平台上找到最相关的活动。
请分析用户的搜索意图，返回JSON格式的结果，包含：
1. relevantIds: 最相关的活动ID数组
2. relatedKeywords: 相关关键词数组（3-5个）
3. suggestedFilters: 推荐的筛选条件对象

只返回JSON，不要其他文字。`

    const activitiesInfo = activities.map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      tags: a.tags,
      description: a.description.substring(0, 100)
    }))

    const prompt = `用户搜索："${query}"

可用活动列表：
${JSON.stringify(activitiesInfo, null, 2)}

请分析搜索意图并返回JSON格式结果。`

    try {
      const response = await this.chat(prompt, systemPrompt, 0.3)
      
      // 尝试解析JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/s)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        console.log('✅ AI搜索结果:', result)
        return result
      }
    } catch (error) {
      console.error('搜索增强失败，使用本地算法:', error.message)
    }
    
    // 降级到本地智能匹配
    return this.localSearchAlgorithm(query, activities)
  }

  /**
   * 本地搜索算法（当API不可用时）
   */
  localSearchAlgorithm(query, activities) {
    console.log('🔄 使用本地搜索算法')
    const lowerQuery = query.toLowerCase()
    
    // 多维度匹配：标题、描述、标签、分类
    const matchedActivities = activities.filter(a => 
      a.title.toLowerCase().includes(lowerQuery) ||
      a.description.toLowerCase().includes(lowerQuery) ||
      a.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      a.category.toLowerCase().includes(lowerQuery)
    )
    
    const keywords = this.extractKeywords(query)
    
    return {
      relevantIds: matchedActivities.map(a => a.id.toString()),
      relatedKeywords: keywords.length > 0 ? keywords : [query, '相关活动', '推荐'],
      suggestedFilters: {
        category: keywords.length > 0 ? this.guessCategory(keywords[0]) : '',
        tags: keywords
      }
    }
  }

  /**
   * 智能推荐活动
   */
  async recommendActivities(userHistory, allActivities) {
    const systemPrompt = `你是一个推荐系统专家。根据用户的历史行为（收藏、报名、浏览），分析用户兴趣，推荐最适合的活动。
返回JSON数组格式的活动ID，例如：["1", "2", "3"]
只返回JSON数组，不要其他文字。`

    const prompt = `用户历史行为：
收藏: ${JSON.stringify(userHistory.favorites)}
报名: ${JSON.stringify(userHistory.registrations)}
浏览: ${JSON.stringify(userHistory.browseHistory.slice(0, 5))}

可选活动：
${JSON.stringify(allActivities.slice(0, 8).map(a => ({
  id: a.id,
  title: a.title,
  category: a.category,
  tags: a.tags
})), null, 2)}

请推荐5个最适合的活动ID。`

    try {
      const response = await this.chat(prompt, systemPrompt, 0.5)
      const match = response.match(/\[.*?\]/s)
      if (match) {
        const ids = JSON.parse(match[0])
        console.log('✅ AI推荐结果:', ids)
        return ids
      }
    } catch (error) {
      console.error('推荐失败:', error)
    }
    
    // 降级：基于用户行为的简单推荐
    const userInterests = new Set([
      ...userHistory.favorites,
      ...userHistory.registrations
    ])
    
    if (userInterests.size > 0) {
      // 推荐相似的活动
      const interestedActivities = allActivities.filter(a => userInterests.has(a.id))
      const categories = interestedActivities.map(a => a.category)
      const tags = interestedActivities.flatMap(a => a.tags)
      
      const recommended = allActivities
        .filter(a => !userInterests.has(a.id))
        .filter(a => categories.includes(a.category) || a.tags.some(tag => tags.includes(tag)))
        .slice(0, 5)
        .map(a => a.id.toString())
      
      return recommended.length > 0 ? recommended : allActivities.slice(0, 5).map(a => a.id.toString())
    }
    
    return allActivities.slice(0, 5).map(a => a.id.toString())
  }

  /**
   * 提取活动摘要
   */
  async extractSummary(description) {
    const systemPrompt = `你是一个文本分析专家。请分析活动描述，提取关键信息。
返回JSON格式：
{
  "summary": "简短摘要（50字以内）",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "highlights": ["亮点1", "亮点2", "亮点3"]
}
只返回JSON，不要其他文字。`

    const prompt = `活动描述：${description}

请提取摘要、关键词和亮点。`

    try {
      const response = await this.chat(prompt, systemPrompt, 0.3)
      const match = response.match(/\{[\s\S]*\}/s)
      if (match) {
        const result = JSON.parse(match[0])
        console.log('✅ AI摘要结果:', result)
        return result
      }
    } catch (error) {
      console.error('摘要提取失败:', error)
    }
    
    // 降级：简单提取
    return {
      summary: description.substring(0, 80) + '...',
      keywords: this.extractKeywords(description),
      highlights: ['内容丰富', '值得参与', '收获满满']
    }
  }

  /**
   * 分析评论
   */
  async analyzeComment(comment) {
    const systemPrompt = `你是一个评论分析专家。分析评论的情感倾向和内容规范性。
返回JSON格式：
{
  "sentiment": "positive/neutral/negative",
  "sentimentScore": 0-100的分数,
  "isAppropriate": true/false,
  "suggestions": "改进建议",
  "tags": ["标签1", "标签2"]
}
只返回JSON，不要其他文字。`

    const prompt = `评论内容：${comment}

请分析情感和规范性。`

    try {
      const response = await this.chat(prompt, systemPrompt, 0.3)
      const match = response.match(/\{[\s\S]*\}/s)
      if (match) {
        const result = JSON.parse(match[0])
        console.log('✅ AI评论分析结果:', result)
        return result
      }
    } catch (error) {
      console.error('评论分析失败:', error)
    }
    
    // 降级：本地分析
    return this.analyzeSentiment(comment)
  }

  /**
   * 数据分析
   */
  async analyzeData(data) {
    const systemPrompt = `你是一个数据分析专家。分析校园活动平台的运营数据，提供洞察和建议。
返回JSON格式：
{
  "insights": ["洞察1", "洞察2", "洞察3"],
  "trends": ["趋势1", "趋势2"],
  "recommendations": ["建议1", "建议2", "建议3"],
  "summary": "总体分析摘要"
}
只返回JSON，不要其他文字。`

    const prompt = `平台数据：
${JSON.stringify(data, null, 2)}

请提供数据分析报告。`

    try {
      const response = await this.chat(prompt, systemPrompt, 0.5)
      const match = response.match(/\{[\s\S]*\}/s)
      if (match) {
        const result = JSON.parse(match[0])
        console.log('✅ AI数据分析结果:', result)
        return result
      }
    } catch (error) {
      console.error('数据分析失败:', error)
    }
    
    // 降级：基础分析
    return {
      insights: [
        `平台共有${data.totalActivities}个活动`,
        `总参与人数达${data.totalParticipants}人`,
        `平均参与率为${data.avgParticipationRate}`
      ],
      trends: [
        '活动数量稳步增长',
        '用户参与度持续提升'
      ],
      recommendations: [
        '继续增加热门分类活动',
        '优化活动时间安排',
        '加强活动宣传推广'
      ],
      summary: '平台整体运营良好，用户活跃度高，建议继续优化活动质量和用户体验'
    }
  }

  /**
   * 生成标题建议
   */
  async generateTitleSuggestions(description) {
    const systemPrompt = `你是一个创意文案专家。根据活动描述生成5个吸引人的标题。
返回JSON数组：["标题1", "标题2", "标题3", "标题4", "标题5"]
标题要简洁有力，能够吸引学生参与。
只返回JSON数组，不要其他文字。`

    const prompt = `活动描述：${description}

请生成5个创意标题。`

    try {
      const response = await this.chat(prompt, systemPrompt, 0.8)
      const match = response.match(/\[.*?\]/s)
      if (match) {
        const titles = JSON.parse(match[0])
        console.log('✅ AI标题建议:', titles)
        return titles
      }
    } catch (error) {
      console.error('标题生成失败:', error)
    }
    
    return ['精彩活动等你来', '不容错过的体验', '火热报名中', '限时参与机会', '精彩不容错过']
  }
}

export default new DeepSeekService()
