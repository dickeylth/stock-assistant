"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardCopy } from "lucide-react"

interface StockDataPoint {
  date: string
  open: string
  high: string
  low: string
  close: string
  volume: string
}

interface StockData {
  symbol: string
  data: StockDataPoint[]
}

export default function StockPromptGenerator() {
  const [symbol, setSymbol] = useState("")
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)

  const formatPrice = (price: string) => Number.parseFloat(price).toFixed(2)
  const formatVolume = (volume: string) => Number.parseInt(volume).toLocaleString()

  const generatePrompt = (stockData: StockData) => {
    const latestData = stockData.data[0]
    const oldestData = stockData.data[stockData.data.length - 1]

    // 计算价格变化百分比
    const priceChange = (
      ((Number.parseFloat(latestData.close) - Number.parseFloat(oldestData.close)) /
        Number.parseFloat(oldestData.close)) *
      100
    ).toFixed(2)

    // 找出最高和最低价格
    const highestPrice = Math.max(...stockData.data.map((d) => Number.parseFloat(d.high)))
    const lowestPrice = Math.min(...stockData.data.map((d) => Number.parseFloat(d.low)))

    // 获取数据的日期范围
    const dateRange = `${oldestData.date} 至 ${latestData.date}`

    // 计算平均交易量
    const avgVolume = (
      stockData.data.reduce((sum, d) => sum + Number.parseInt(d.volume), 0) / stockData.data.length
    ).toFixed(0)

    // 生成每日数据字符串，限制为最近100天
    const dailyDataString = stockData.data
      .slice(0, 100)
      .map(
        (d) =>
          `${d.date}: 开盘$${formatPrice(d.open)}, 最高$${formatPrice(d.high)}, 最低$${formatPrice(d.low)}, 收盘$${formatPrice(d.close)}, 成交量${formatVolume(d.volume)}`,
      )
      .join("\n")

    return `请根据以下历史交易数据对 ${stockData.symbol} 股票进行全面分析：

数据范围：${dateRange}（共 ${stockData.data.length} 个交易日，显示最近100天）

关键统计数据：
- 最新收盘价：$${formatPrice(latestData.close)}（截至 ${latestData.date}）
- 整体价格变化：${priceChange}%
- 最高价：$${highestPrice.toFixed(2)}
- 最低价：$${lowestPrice.toFixed(2)}
- 平均每日交易量：${formatVolume(avgVolume)}

每日交易数据（最近100天）：
${dailyDataString}

请基于上述数据进行以下分析，并提供一个综合的交易计划：

1. 技术分析：
   - 计算并解释关键技术指标（如MA、RSI、MACD）
   - 识别主要支撑位和阻力位
   - 分析价格趋势（短期、中期、长期）
   - 识别任何显著的图表形态

2. 成交量分析：
   - 评估成交量与价格变动的关系
   - 识别任何异常的成交量模式

3. 波动性和风险评估：
   - 分析股票的历史波动性及其趋势
   - 评估当前的风险水平

4. 市场对比：
   - 将该股票的表现与相关市场指数进行对比
   - 讨论股票的相对强弱

5. 潜在催化剂：
   - 识别可能影响股价的即将到来的事件或因素

6. 交易计划：
   基于以上分析，制定一个详细的交易计划，包括：
   - 建议的交易方向（做多/做空）
   - 具体的入场价位
   - 止损水平
   - 目标获利价位
   - 建议的持仓时间
   - 任何特定的交易条件或触发因素

7. 风险管理：
   - 提出针对这个交易计划的具体风险管理策略
   - 讨论可能影响交易计划的主要风险因素

请确保您的分析和交易计划考虑了技术面、基本面和市场情绪等多个因素。提供一个平衡的观点，同时考虑看涨和看跌的可能性。

注意：本分析和交易计划仅基于历史数据和技术分析，不应被视为财务建议。实际交易时请考虑当前市场条件、个人风险承受能力，并咨询专业的财务顾问。`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (symbol) {
      setIsLoading(true)
      setError("")
      try {
        const response = await fetch(`/api/stock-data?symbol=${symbol}`)
        if (!response.ok) {
          throw new Error("Failed to fetch stock data")
        }
        const data: StockData = await response.json()
        const prompt = generatePrompt(data)
        setGeneratedPrompt(prompt)
      } catch (err) {
        setError("获取股票数据失败。请重试。")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000) // 2秒后重置复制成功状态
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">股票分析 Prompt 生成器</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="symbol">股票代码</Label>
          <Input
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="输入股票代码（如 AAPL）"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "加载中..." : "生成 Prompt"}
        </Button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {generatedPrompt && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="generated-prompt">生成的 Prompt</Label>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className={`flex items-center ${copySuccess ? "bg-green-500 text-white" : ""}`}
            >
              <ClipboardCopy className="w-4 h-4 mr-2" />
              {copySuccess ? "已复制" : "复制"}
            </Button>
          </div>
          <Textarea id="generated-prompt" value={generatedPrompt} readOnly className="h-[800px]" />
        </div>
      )}
    </div>
  )
}

