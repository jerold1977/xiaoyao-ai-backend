# 小爻易算 AI-Agent Backend

DeepSeek API 代理服务，为微信小程序提供AI大师解读功能。

## 🚀 快速部署（Vercel，免费）

### 1. 准备工作
- Vercel 账号（用 GitHub/邮箱注册，免费）
- 本项目代码（已包含在 `miniprogram/backend/` 目录）

### 2. 部署步骤

#### 方法A：通过 Vercel Web 界面（推荐）

1. **上传代码到 GitHub**
   - 在 `miniprogram/backend/` 目录下初始化 Git 仓库
   - 推送到你的 GitHub 仓库

2. **连接到 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测 `package.json` 并部署

3. **配置环境变量**
   - 在 Vercel 项目设置中，添加环境变量：
     - `DEEPSEEK_API_KEY`: sk-fa3343647506476bad05b8886044991a

4. **部署完成**
   - Vercel 会给你一个域名（如 `xiaoyao-ai.vercel.app`）
   - 测试：`https://your-domain.vercel.app/api/divination-ai`（POST请求）

#### 方法B：通过 Vercel CLI（高级）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd miniprogram/backend
vercel --prod

# 配置环境变量
vercel env add DEEPEEK_API_KEY
# 输入：sk-fa3343647506476bad05b8886044991a
```

### 3. 测试 Backend

```bash
# 健康检查
curl https://your-domain.vercel.app/

# 测试AI解读接口
curl -X POST https://your-domain.vercel.app/api/divination-ai \
  -H "Content-Type: application/json" \
  -d '{
    "masterId": "yuan_tiangang",
    "moduleId": "meihua",
    "userData": {
      "benGua": "乾为天",
      "huGua": "乾为天",
      "bianGua": "乾为天",
      "dongYao": 1
    }
  }'
```

## 🔧 本地开发

```bash
# 安装依赖
cd miniprogram/backend
npm install

# 配置环境变量
cp .env.template .env
# 编辑 .env 文件，填入你的 DeepSeek API Key

# 启动开发服务器
npm run dev

# 服务器运行在 http://localhost:3000
```

## 📦 文件说明

- `server.js` - Express 服务器，处理AI解读请求
- `package.json` - 项目依赖配置
- `.env.template` - 环境变量模板
- `vercel.json` - Vercel 部署配置
- `README.md` - 本文件

## 🔗 小程序前端对接

部署成功后，修改 `miniprogram/utils/ai-service.js`：

```javascript
// 替换 Mock 数据为真实API调用
function getAiInterpretation(masterId, moduleId, userData) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://your-domain.vercel.app/api/divination-ai',  // 替换成你的域名
      method: 'POST',
      data: {
        masterId: masterId,
        moduleId: moduleId,
        userData: userData
      },
      success: (res) => {
        resolve(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}
```

## ⚠️ 注意事项

1. **API Key 安全**：不要提交 `.env` 文件到 GitHub
2. **CORS 配置**：已启用 CORS，允许小程序调用
3. **免费额度**：Vercel 免费版每月有 100GB 流量限制，足够使用
4. **DeepSeek 费用**：约 ¥0.001/千token，每次解读约 ¥0.01

## 📞 支持

如有问题，请检查：
1. Vercel 部署日志
2. DeepSeek API Key 是否正确
3. 小程序域名是否在白名单中
