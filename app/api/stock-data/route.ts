import { NextResponse } from "next/server"

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 })
  }

  if (!ALPHA_VANTAGE_API_KEY) {
    return NextResponse.json({ error: "API key is required" }, { status: 500 })
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  let resData: StockPrice

  try {
    const response = await fetch(url)
    resData = await response.json() as StockPrice

    const message = resData["Error Message"] || resData["Information"]
    if (message) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data: " + (error as Error).stack }, { status: 500 })
  }

  try {

    const timeSeriesData = resData["Time Series (Daily)"]
    const dates = Object.keys(timeSeriesData)

    const formattedData = dates.map((date) => ({
      date,
      open: timeSeriesData[date]["1. open"],
      high: timeSeriesData[date]["2. high"],
      low: timeSeriesData[date]["3. low"],
      close: timeSeriesData[date]["4. close"],
      volume: timeSeriesData[date]["5. volume"],
    }))

    return NextResponse.json({
      symbol,
      data: formattedData,
    })
  } catch (error) {
    console.error("Error parsing stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data: " + (error as Error).stack, data: resData, }, { status: 500 })
  }
}

// for cloudflare pages
export const runtime = 'edge'