 interface StockPrice {
    "Meta Data":           MetaData;
    "Time Series (Daily)": { [key: string]: TimeSeriesDaily };
    "Error Message"?:     string;
}

interface MetaData {
    "1. Information":    string;
    "2. Symbol":         string;
    "3. Last Refreshed": Date;
    "4. Output Size":    string;
    "5. Time Zone":      string;
}

interface TimeSeriesDaily {
    "1. open":   string;
    "2. high":   string;
    "3. low":    string;
    "4. close":  string;
    "5. volume": string;
}
