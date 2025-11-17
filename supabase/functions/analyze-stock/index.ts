import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const FINANCIAL_DATASETS_API_KEY = Deno.env.get('FINANCIAL_DATASETS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) throw new Error('Unauthorized');

    console.log(`Analyzing ${ticker} for user ${user.id}`);

    // Fetch market data
    const marketDataResponse = await fetch(
      `https://api.financialdatasets.ai/stocks/prices/${ticker}?limit=30`,
      {
        headers: {
          'X-API-KEY': FINANCIAL_DATASETS_API_KEY!,
        },
      }
    );
    const marketData = await marketDataResponse.json();

    // Run all agents in parallel
    const [sentimentResult, fundamentalsResult, quantResult] = await Promise.all([
      runSentimentAgent(ticker, OPENAI_API_KEY!),
      runFundamentalsAgent(ticker, marketData, OPENAI_API_KEY!),
      runQuantAgent(ticker, marketData, OPENAI_API_KEY!),
    ]);

    // Run risk and portfolio managers with all agent data
    const riskResult = await runRiskManager(ticker, marketData, sentimentResult, fundamentalsResult, quantResult, OPENAI_API_KEY!);
    const portfolioResult = await runPortfolioManager(ticker, sentimentResult, fundamentalsResult, quantResult, riskResult, OPENAI_API_KEY!);

    // Store all analyses
    const analyses = [
      { agent_type: 'sentiment', ...sentimentResult },
      { agent_type: 'fundamentals', ...fundamentalsResult },
      { agent_type: 'quant', ...quantResult },
      { agent_type: 'risk', ...riskResult },
      { agent_type: 'portfolio', ...portfolioResult },
    ];

    for (const analysis of analyses) {
      await supabase.from('agent_analysis').insert({
        user_id: user.id,
        ticker,
        agent_type: analysis.agent_type,
        analysis: analysis.analysis || {},
        reasoning: analysis.reasoning,
        recommendation: analysis.recommendation,
        confidence: analysis.confidence,
      });
    }

    // Execute trade if portfolio manager recommends
    if (portfolioResult.recommendation !== 'HOLD') {
      await executeTrade(supabase, user.id, ticker, portfolioResult, marketData);
    }

    return new Response(JSON.stringify({ success: true, analyses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function runSentimentAgent(ticker: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a sentiment analysis expert for financial markets. Analyze market sentiment for ${ticker} and provide: 1) Overall sentiment (POSITIVE/NEGATIVE/NEUTRAL), 2) Confidence score (0-1), 3) Key sentiment drivers`
        },
        {
          role: 'user',
          content: `Analyze current market sentiment for ${ticker}. Consider recent news, social media trends, and general market mood.`
        }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  return {
    reasoning: content,
    recommendation: content.includes('POSITIVE') ? 'BULLISH' : content.includes('NEGATIVE') ? 'BEARISH' : 'NEUTRAL',
    confidence: 0.7,
    analysis: { raw: content }
  };
}

async function runFundamentalsAgent(ticker: string, marketData: any, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a fundamental analysis expert. Analyze ${ticker} fundamentals and provide: 1) Valuation assessment, 2) Growth prospects, 3) Financial health, 4) Recommendation (BUY/SELL/HOLD)`
        },
        {
          role: 'user',
          content: `Analyze fundamentals for ${ticker}. Recent price data: ${JSON.stringify(marketData?.prices?.slice(0, 5))}`
        }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  return {
    reasoning: content,
    recommendation: content.includes('BUY') ? 'BUY' : content.includes('SELL') ? 'SELL' : 'HOLD',
    confidence: 0.75,
    analysis: { raw: content }
  };
}

async function runQuantAgent(ticker: string, marketData: any, apiKey: string) {
  const prices = marketData?.prices || [];
  const recentPrices = prices.slice(0, 30).map((p: any) => p.close);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a quantitative analyst. Analyze ${ticker} technical patterns and provide: 1) Trend direction, 2) Momentum indicators, 3) Key levels, 4) Recommendation`
        },
        {
          role: 'user',
          content: `Analyze technical patterns for ${ticker}. Recent closing prices: ${recentPrices.join(', ')}`
        }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  return {
    reasoning: content,
    recommendation: content.toLowerCase().includes('bullish') || content.toLowerCase().includes('uptrend') ? 'BUY' : 
                   content.toLowerCase().includes('bearish') || content.toLowerCase().includes('downtrend') ? 'SELL' : 'HOLD',
    confidence: 0.8,
    analysis: { raw: content, prices: recentPrices }
  };
}

async function runRiskManager(ticker: string, marketData: any, sentiment: any, fundamentals: any, quant: any, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a risk management expert. Assess risk for ${ticker} and provide: 1) Risk level (LOW/MEDIUM/HIGH), 2) Position sizing recommendation, 3) Stop loss levels`
        },
        {
          role: 'user',
          content: `Assess risk for ${ticker}. Sentiment: ${sentiment.recommendation}, Fundamentals: ${fundamentals.recommendation}, Quant: ${quant.recommendation}`
        }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  return {
    reasoning: content,
    recommendation: 'APPROVED',
    confidence: 0.85,
    analysis: { raw: content }
  };
}

async function runPortfolioManager(ticker: string, sentiment: any, fundamentals: any, quant: any, risk: any, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a portfolio manager making final trading decisions. Based on all agent recommendations, decide: BUY, SELL, or HOLD for ${ticker}. Provide clear reasoning.`
        },
        {
          role: 'user',
          content: `Make trading decision for ${ticker}:
Sentiment: ${sentiment.recommendation} (${sentiment.confidence})
Fundamentals: ${fundamentals.recommendation} (${fundamentals.confidence})
Quant: ${quant.recommendation} (${quant.confidence})
Risk: ${risk.recommendation} (${risk.confidence})`
        }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Determine recommendation
  let recommendation = 'HOLD';
  if (content.toLowerCase().includes('buy') || content.toLowerCase().includes('purchase')) {
    recommendation = 'BUY';
  } else if (content.toLowerCase().includes('sell')) {
    recommendation = 'SELL';
  }
  
  return {
    reasoning: content,
    recommendation,
    confidence: 0.9,
    analysis: { raw: content }
  };
}

async function executeTrade(supabase: any, userId: string, ticker: string, decision: any, marketData: any) {
  const currentPrice = marketData?.prices?.[0]?.close || 100;
  
  // Get current portfolio
  const { data: portfolio } = await supabase
    .from('portfolio')
    .select('*')
    .eq('user_id', userId)
    .eq('ticker', ticker)
    .single();

  const cashBalance = portfolio?.cash_balance || 100000;
  let quantity = 0;
  let action = decision.recommendation.toLowerCase();

  if (action === 'buy') {
    // Buy with 10% of cash
    const buyAmount = cashBalance * 0.1;
    quantity = Math.floor(buyAmount / currentPrice);
  } else if (action === 'sell' && portfolio) {
    // Sell 50% of holdings
    quantity = parseFloat(portfolio.quantity) * 0.5;
  }

  if (quantity > 0) {
    const totalValue = quantity * currentPrice;
    const newCash = action === 'buy' ? cashBalance - totalValue : cashBalance + totalValue;
    const newQuantity = action === 'buy' ? 
      (parseFloat(portfolio?.quantity || 0) + quantity) :
      (parseFloat(portfolio?.quantity || 0) - quantity);

    // Insert trade
    await supabase.from('trades').insert({
      user_id: userId,
      ticker,
      action,
      quantity,
      price: currentPrice,
      total_value: totalValue,
      cash_after: newCash,
    });

    // Update portfolio
    if (portfolio) {
      await supabase.from('portfolio').update({
        quantity: newQuantity,
        average_price: currentPrice,
        cash_balance: newCash,
        total_value: newCash + (newQuantity * currentPrice),
        last_updated: new Date().toISOString(),
      }).eq('id', portfolio.id);
    } else {
      await supabase.from('portfolio').insert({
        user_id: userId,
        ticker,
        quantity: newQuantity,
        average_price: currentPrice,
        cash_balance: newCash,
        total_value: newCash + (newQuantity * currentPrice),
      });
    }
  }
}