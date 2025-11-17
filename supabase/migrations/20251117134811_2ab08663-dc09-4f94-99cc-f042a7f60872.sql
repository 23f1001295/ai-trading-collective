-- Create portfolio table to track holdings and cash
CREATE TABLE public.portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ticker TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 0,
  average_price DECIMAL,
  cash_balance DECIMAL NOT NULL DEFAULT 100000,
  total_value DECIMAL NOT NULL DEFAULT 100000,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trades table to track all trading activity
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ticker TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('buy', 'sell', 'hold')),
  quantity DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  total_value DECIMAL NOT NULL,
  cash_after DECIMAL NOT NULL,
  trade_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_analysis table to store AI agent reasoning
CREATE TABLE public.agent_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ticker TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('market_data', 'sentiment', 'fundamentals', 'quant', 'risk', 'portfolio')),
  analysis JSONB NOT NULL,
  reasoning TEXT,
  recommendation TEXT,
  confidence DECIMAL,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create backtest_results table
CREATE TABLE public.backtest_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ticker TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  initial_capital DECIMAL NOT NULL,
  final_value DECIMAL NOT NULL,
  total_return DECIMAL NOT NULL,
  total_trades INTEGER NOT NULL,
  win_rate DECIMAL,
  results_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio
CREATE POLICY "Users can view their own portfolio"
ON public.portfolio FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio"
ON public.portfolio FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio"
ON public.portfolio FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for trades
CREATE POLICY "Users can view their own trades"
ON public.trades FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
ON public.trades FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for agent_analysis
CREATE POLICY "Users can view their own analysis"
ON public.agent_analysis FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis"
ON public.agent_analysis FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for backtest_results
CREATE POLICY "Users can view their own backtest results"
ON public.backtest_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backtest results"
ON public.backtest_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_portfolio_user_id ON public.portfolio(user_id);
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_ticker ON public.trades(ticker);
CREATE INDEX idx_agent_analysis_user_id ON public.agent_analysis(user_id);
CREATE INDEX idx_agent_analysis_ticker ON public.agent_analysis(ticker);
CREATE INDEX idx_backtest_user_id ON public.backtest_results(user_id);