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
    const { ticker, startDate, endDate } = await req.json();
    const FINANCIAL_DATASETS_API_KEY = Deno.env.get('FINANCIAL_DATASETS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) throw new Error('Unauthorized');

    console.log(`Running backtest for ${ticker} from ${startDate} to ${endDate}`);

    // Fetch historical data
    const marketDataResponse = await fetch(
      `https://api.financialdatasets.ai/stocks/prices/${ticker}?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          'X-API-KEY': FINANCIAL_DATASETS_API_KEY!,
        },
      }
    );
    const marketData = await marketDataResponse.json();
    const prices = marketData?.prices || [];

    if (prices.length === 0) {
      throw new Error('No historical data available for this period');
    }

    // Simple backtest simulation
    let capital = 100000;
    let shares = 0;
    let trades = 0;
    let wins = 0;
    const tradeHistory: any[] = [];

    // Buy and hold strategy with simple signals
    for (let i = 0; i < prices.length - 1; i++) {
      const currentPrice = prices[i].close;
      const nextPrice = prices[i + 1]?.close;
      
      // Simple moving average crossover strategy
      if (i >= 5) {
        const shortMA = prices.slice(i - 4, i + 1).reduce((sum: number, p: any) => sum + p.close, 0) / 5;
        const longMA = prices.slice(i - 9, i + 1).reduce((sum: number, p: any) => sum + p.close, 0) / 10;
        
        // Buy signal
        if (shortMA > longMA && shares === 0 && capital > currentPrice) {
          shares = Math.floor(capital * 0.9 / currentPrice);
          const cost = shares * currentPrice;
          capital -= cost;
          trades++;
          tradeHistory.push({
            date: prices[i].date,
            action: 'buy',
            price: currentPrice,
            shares,
          });
        }
        // Sell signal
        else if (shortMA < longMA && shares > 0) {
          const revenue = shares * currentPrice;
          const profit = revenue - (shares * (tradeHistory[tradeHistory.length - 1]?.price || currentPrice));
          if (profit > 0) wins++;
          capital += revenue;
          trades++;
          tradeHistory.push({
            date: prices[i].date,
            action: 'sell',
            price: currentPrice,
            shares,
          });
          shares = 0;
        }
      }
    }

    // Calculate final value
    const finalPrice = prices[prices.length - 1].close;
    const finalValue = capital + (shares * finalPrice);
    const totalReturn = ((finalValue - 100000) / 100000) * 100;
    const winRate = trades > 0 ? (wins / trades) * 100 : 0;

    // Store backtest results
    await supabase.from('backtest_results').insert({
      user_id: user.id,
      ticker,
      start_date: startDate,
      end_date: endDate,
      initial_capital: 100000,
      final_value: finalValue,
      total_return: totalReturn,
      total_trades: trades,
      win_rate: winRate,
      results_data: { tradeHistory, prices: prices.length },
    });

    return new Response(
      JSON.stringify({
        ticker,
        initialCapital: 100000,
        finalValue,
        totalReturn,
        totalTrades: trades,
        winRate,
        tradeHistory,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});