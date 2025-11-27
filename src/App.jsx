import React, { useState } from 'react';
import { TrendingUp, DollarSign, Search, AlertCircle, LineChart, Globe, Calendar, Target } from 'lucide-react';

const ForexAnalyzer = () => {
  const [selectedPair, setSelectedPair] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const tradingPairs = [
    { value: 'XAUUSD', label: 'XAU/USD (Gold)', category: 'Commodities' },
    { value: 'XAGUSD', label: 'XAG/USD (Silver)', category: 'Commodities' },
    { value: 'EURUSD', label: 'EUR/USD', category: 'Major Pairs' },
    { value: 'GBPUSD', label: 'GBP/USD', category: 'Major Pairs' },
    { value: 'USDJPY', label: 'USD/JPY', category: 'Major Pairs' },
    { value: 'AUDUSD', label: 'AUD/USD', category: 'Major Pairs' },
    { value: 'USDCAD', label: 'USD/CAD', category: 'Major Pairs' },
    { value: 'NZDUSD', label: 'NZD/USD', category: 'Major Pairs' },
    { value: 'USDCHF', label: 'USD/CHF', category: 'Major Pairs' },
    { value: 'EURJPY', label: 'EUR/JPY', category: 'Cross Pairs' },
    { value: 'GBPJPY', label: 'GBP/JPY', category: 'Cross Pairs' },
    { value: 'EURGBP', label: 'EUR/GBP', category: 'Cross Pairs' },
    { value: 'BTCUSD', label: 'BTC/USD (Bitcoin)', category: 'Crypto' },
    { value: 'ETHUSD', label: 'ETH/USD (Ethereum)', category: 'Crypto' },
  ];

  const groupedPairs = tradingPairs.reduce((acc, pair) => {
    if (!acc[pair.category]) acc[pair.category] = [];
    acc[pair.category].push(pair);
    return acc;
  }, {});

  const analyzeMarket = async () => {
    if (!selectedPair) {
      setError('Silakan pilih trading pair terlebih dahulu');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Search untuk berita dan data terkini
      const searches = [
        `${selectedPair} price today ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        `${selectedPair} technical analysis forecast`,
        `${selectedPair} news today`,
        'Federal Reserve interest rate decision',
        'US dollar index DXY today',
        'geopolitical tensions impact forex'
      ];

      const searchResults = [];
      
      for (const query of searches) {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [
              { 
                role: "user", 
                content: `Search the web for: ${query}. Provide a concise summary of the most important information found.`
              }
            ],
            tools: [
              {
                "type": "web_search_20250305",
                "name": "web_search"
              }
            ]
          })
        });

        const data = await response.json();
        const textContent = data.content
          .filter(item => item.type === "text")
          .map(item => item.text)
          .join("\n");
        
        searchResults.push({ query, result: textContent });
      }

      // Generate comprehensive analysis
      const analysisResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            { 
              role: "user", 
              content: `Based on the following search results, create a comprehensive trading analysis for ${selectedPair}:

${searchResults.map((r, i) => `Search ${i + 1} (${r.query}):\n${r.result}\n`).join('\n')}

Please provide:
1. Current market price and trend
2. Technical analysis (support/resistance levels, indicators)
3. Fundamental analysis (economic factors, news impact)
4. Trading scenarios (bullish/bearish setup with entry, stop loss, take profit)
5. Risk factors and probability assessment
6. Best time to trade today

Format the response as a structured JSON with these fields:
{
  "currentPrice": "string",
  "trend": "bullish/bearish/sideways",
  "technicalAnalysis": {
    "resistance": ["level1", "level2", "level3"],
    "support": ["level1", "level2", "level3"],
    "indicators": "string description"
  },
  "fundamentalAnalysis": "string",
  "bullishScenario": {
    "entry": "string",
    "stopLoss": "string",
    "targets": ["tp1", "tp2", "tp3"],
    "probability": "number"
  },
  "bearishScenario": {
    "entry": "string",
    "stopLoss": "string",
    "targets": ["tp1", "tp2", "tp3"],
    "probability": "number"
  },
  "riskFactors": ["risk1", "risk2", "risk3"],
  "bestTradingTime": "string",
  "recommendation": "string"
}

Respond ONLY with valid JSON, no markdown formatting.`
            }
          ]
        })
      });

      const analysisData = await analysisResponse.json();
      const analysisText = analysisData.content
        .filter(item => item.type === "text")
        .map(item => item.text)
        .join("\n");

      // Parse JSON response
      const cleanJson = analysisText.replace(/```json|```/g, '').trim();
      const parsedAnalysis = JSON.parse(cleanJson);

      setAnalysisResult(parsedAnalysis);

    } catch (err) {
      console.error('Analysis error:', err);
      setError('Terjadi kesalahan saat menganalisa. Silakan coba lagi.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Forex Auto Analyzer</h1>
          </div>
          <p className="text-blue-200 text-lg">Analisa Otomatis dengan Data Real-time dari Internet</p>
        </div>

        {/* Selection Panel */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Pilih Trading Pair</h2>
          </div>
          
          <select 
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="w-full p-4 rounded-lg bg-slate-800 text-white border-2 border-blue-500/50 focus:border-blue-400 focus:outline-none text-lg mb-4"
          >
            <option value="">-- Pilih Pair --</option>
            {Object.entries(groupedPairs).map(([category, pairs]) => (
              <optgroup key={category} label={category}>
                {pairs.map(pair => (
                  <option key={pair.value} value={pair.value}>
                    {pair.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <button
            onClick={analyzeMarket}
            disabled={isAnalyzing || !selectedPair}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 text-lg"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Menganalisa...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Analisa Sekarang
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Market Overview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Market Overview</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-blue-300 text-sm mb-1">Current Price</p>
                  <p className="text-white text-2xl font-bold">{analysisResult.currentPrice}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-blue-300 text-sm mb-1">Trend</p>
                  <p className={`text-2xl font-bold ${
                    analysisResult.trend === 'bullish' ? 'text-green-400' :
                    analysisResult.trend === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {analysisResult.trend.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Analysis */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Technical Analysis</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h3 className="text-green-400 font-semibold mb-3 text-lg">🟢 Resistance Levels</h3>
                  <div className="space-y-2">
                    {analysisResult.technicalAnalysis.resistance.map((level, i) => (
                      <div key={i} className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                        <p className="text-green-300">R{i + 1}: {level}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-red-400 font-semibold mb-3 text-lg">🔴 Support Levels</h3>
                  <div className="space-y-2">
                    {analysisResult.technicalAnalysis.support.map((level, i) => (
                      <div key={i} className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                        <p className="text-red-300">S{i + 1}: {level}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-blue-400 font-semibold mb-2">Indicators</h3>
                <p className="text-gray-300">{analysisResult.technicalAnalysis.indicators}</p>
              </div>
            </div>

            {/* Fundamental Analysis */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Fundamental Analysis</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">{analysisResult.fundamentalAnalysis}</p>
            </div>

            {/* Trading Scenarios */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bullish Scenario */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-700/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                <h2 className="text-2xl font-bold text-green-400 mb-4">📈 Bullish Scenario</h2>
                <div className="space-y-3">
                  <div className="bg-black/30 p-3 rounded-lg">
                    <p className="text-green-300 text-sm">Entry Point</p>
                    <p className="text-white font-bold text-lg">{analysisResult.bullishScenario.entry}</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg">
                    <p className="text-red-300 text-sm">Stop Loss</p>
                    <p className="text-white font-bold text-lg">{analysisResult.bullishScenario.stopLoss}</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg">
                    <p className="text-green-300 text-sm mb-2">Take Profit Targets</p>
                    {analysisResult.bullishScenario.targets.map((tp, i) => (
                      <p key={i} className="text-white font-semibold">TP{i + 1}: {tp}</p>
                    ))}
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-lg border border-green-500">
                    <p className="text-green-300 text-sm">Probability</p>
                    <p className="text-white font-bold text-2xl">{analysisResult.bullishScenario.probability}%</p>
                  </div>
                </div>
              </div>

              {/* Bearish Scenario */}
              <div className="bg-gradient-to-br from-red-500/20 to-red-700/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
                <h2 className="text-2xl font-bold text-red-400 mb-4">📉 Bearish Scenario</h2>
                <div className="space-y-3">
                  <div className="bg-black/30 p-3 rounded-lg">
                    <p className="text-red-300 text-sm">Entry Point</p>
                    <p className="text-white font-bold text-lg">{analysisResult.bearishScenario.entry}</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg">
                    <p className="text-green-300 text-sm">Stop Loss</p>
                    <p className="text-white font-bold text-lg">{analysisResult.bearishScenario.stopLoss}</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg">
                    <p className="text-red-300 text-sm mb-2">Take Profit Targets</p>
                    {analysisResult.bearishScenario.targets.map((tp, i) => (
                      <p key={i} className="text-white font-semibold">TP{i + 1}: {tp}</p>
                    ))}
                  </div>
                  <div className="bg-red-500/20 p-3 rounded-lg border border-red-500">
                    <p className="text-red-300 text-sm">Probability</p>
                    <p className="text-white font-bold text-2xl">{analysisResult.bearishScenario.probability}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors & Recommendation */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-bold text-white">Risk Factors</h2>
                </div>
                <ul className="space-y-2">
                  {analysisResult.riskFactors.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">⚠️</span>
                      <span className="text-gray-300">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Trading Info</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-blue-300 text-sm mb-1">Best Trading Time</p>
                    <p className="text-white font-semibold">{analysisResult.bestTradingTime}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-lg border border-blue-500/30">
                    <p className="text-blue-300 text-sm mb-2">💡 Recommendation</p>
                    <p className="text-white font-semibold">{analysisResult.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-200 text-sm">
                <strong>⚠️ Disclaimer:</strong> Analisa ini berdasarkan data dan berita terkini dari internet. 
                Bukan saran investasi. Trading forex memiliki risiko tinggi. Gunakan risk management yang baik 
                dan trade sesuai dengan strategi Anda sendiri.
              </p>
            </div>
          </div>
        )}

        {/* Info Panel */}
        {!analysisResult && !isAnalyzing && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
            <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Pilih Trading Pair untuk Memulai</h3>
            <p className="text-blue-200 mb-4">
              Sistem akan otomatis mengambil data real-time dari internet termasuk:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-green-400 font-semibold mb-2">📊 Data Teknikal</p>
                <p className="text-gray-300 text-sm">Harga, support, resistance, indikator</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-blue-400 font-semibold mb-2">📰 Berita Terkini</p>
                <p className="text-gray-300 text-sm">News, events, fundamental factors</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-purple-400 font-semibold mb-2">🎯 Trading Setup</p>
                <p className="text-gray-300 text-sm">Entry, SL, TP, dan rekomendasi</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForexAnalyzer;
