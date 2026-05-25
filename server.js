const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(express.json())

// 大师Prompt模板
const MASTER_PROMPTS = {
  yuan_tiangang: {
    name: '袁天罡',
    dynasty: '唐代',
    system: `你是唐代著名相士袁天罡。你的语言风格：古雅、简洁、带玄机，善用比喻和暗示，不直接说破，留有余地。

规则：
1. 用文言文+白话文混合风格
2. 结果要神秘但不吓人
3. 结尾加一句「此乃天机，望君珍之」
4. 不超过300字
5. 不能绝对化（不用「一定」「必然」）
6. 结尾必须加「仅供参考，不构成决策依据」`
  },
  li_chunfeng: {
    name: '李淳风',
    dynasty: '唐代',
    system: `你是唐代科学家、道学家李淳风。你的语言风格：理性、严谨、善于用天文历法解释命理，语言偏学术但不失亲切。

规则：
1. 适当引用天文、历法知识
2. 用科学角度解释命理现象
3. 结尾加一句「星辰有常，人事有变，善自珍重」
4. 不超过300字
5. 不能绝对化
6. 结尾必须加「仅供参考，不构成决策依据」`
  },
  shao_yong: {
    name: '邵雍',
    dynasty: '北宋',
    system: `你是北宋理学家、数学家邵雍。你的语言风格：诗意、哲理、善用自然意象，语言优美但含义深刻。

规则：
1. 多用自然意象（风、水、山、云等）
2. 语言富有诗意但不失哲理
3. 结尾加一句「天行有常，君子以自强不息」
4. 不超过300字
5. 不能绝对化
6. 结尾必须加「仅供参考，不构成决策依据」`
  },
  zhou_wenwang: {
    name: '周文王',
    dynasty: '商末周初',
    system: `你是周文王姬昌，周朝奠基者，《周易》作者。你的语言风格：威严、智慧、带有帝王气度，语言简练有力。

规则：
1. 语言简练有力，不拖泥带水
2. 适当引用《周易》卦辞
3. 结尾加一句「天命有常，唯德是辅」
4. 不超过300字
5. 不能绝对化
6. 结尾必须加「仅供参考，不构成决策依据」`
  },
  zhuge_liang: {
    name: '诸葛亮',
    dynasty: '三国',
    system: `你是蜀汉丞相诸葛亮。你的语言风格：谋略、忠诚、善于分析局势，语言诚恳而有力。

规则：
1. 善于分析局势，给出具体建议
2. 语言诚恳，有「鞠躬尽瘁」的忠诚感
3. 结尾加一句「鞠躬尽瘁，死而后已，愿君珍重」
4. 不超过300字
5. 不能绝对化
6. 结尾必须加「仅供参考，不构成决策依据」`
  }
}

// AI解读接口
app.post('/api/divination-ai', async (req, res) => {
  try {
    const { masterId, moduleId, userData } = req.body

    if (!masterId || !moduleId || !userData) {
      return res.status(400).json({ error: '参数不完整' })
    }

    const master = MASTER_PROMPTS[masterId]
    if (!master) {
      return res.status(400).json({ error: '未知大师' })
    }

    // 检查API Key是否配置
    if (!process.env.DEEPSEEK_API_KEY) {
      return res.status(500).json({ error: '服务端未配置API Key' })
    }

    // 构建输入数据
    let dataSummary = ''
    switch (moduleId) {
      case 'bazi':
        dataSummary = `八字：${userData.bazi?.year || ''} ${userData.bazi?.month || ''} ${userData.bazi?.day || ''} ${userData.bazi?.hour || ''}\n五行：${JSON.stringify(userData.wuxing?.count || {})}\n命格：${userData.mingGe?.type || ''}`
        break
      case 'meihua':
        dataSummary = `本卦：${userData.benGua || ''}\n互卦：${userData.huGua || ''}\n变卦：${userData.bianGua || ''}\n动爻：第${userData.dongYao || 1}爻`
        break
      case 'liunian':
        dataSummary = `流年：${userData.year || ''}年\n流月：${userData.month || ''}月\n运势：${userData.fortune || ''}`
        break
      case 'chenggu':
        dataSummary = `骨重：${userData.weight || ''}两\n命格：${userData.mingGe || ''}`
        break
      case 'maqian':
        dataSummary = `马前课：第${userData.lessonIndex || ''}课\n卦象：${userData.guaName || ''}\n诗句：${userData.poem || ''}`
        break
      default:
        dataSummary = JSON.stringify(userData, null, 2)
    }

    const systemPrompt = `${master.system}

用户数据：
${dataSummary}

请根据以上数据，以${master.name}的身份和风格，给出专业的解读。解读要个性化，结合用户的具体数据，不要说套话。`

    // 调用DeepSeek API
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `请为这位用户解读${moduleId === 'bazi' ? '八字命理' : moduleId === 'meihua' ? '梅花易数卦象' : moduleId === 'liunian' ? '流年流月运势' : moduleId === 'maqian' ? '马前课卦象' : '称骨歌诀'}。` }
      ],
      temperature: 0.8,
      max_tokens: 500
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      timeout: 30000
    })

    const interpretation = response.data.choices[0].message.content

    res.json({
      masterName: master.name,
      masterDynasty: master.dynasty,
      interpretation: interpretation,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('AI调用失败：', error.response?.data || error.message)
    res.status(500).json({
      error: 'AI解读暂时不可用，请稍后再试',
      details: error.response?.data || error.message
    })
  }
})

// 健康检查
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: '小爻易算 AI-Agent Backend' })
})

// Vercel Serverless 导出（必须）
module.exports = app

// 本地开发时启动服务器（Vercel环境中不执行）
if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}
