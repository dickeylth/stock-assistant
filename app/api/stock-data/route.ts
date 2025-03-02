import { NextResponse } from "next/server"

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 })
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data["Error Message"]) {
      return NextResponse.json({ error: data["Error Message"] }, { status: 400 })
    }

    const timeSeriesData = data["Time Series (Daily)"]
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
    console.error("Error fetching stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}

