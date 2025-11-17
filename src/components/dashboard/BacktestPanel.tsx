import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const BacktestPanel = () => {
  const [ticker, setTicker] = useState("AAPL");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleBacktest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('backtest', {
        body: { 
          ticker: ticker.toUpperCase(),
          startDate,
          endDate
        }
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: "Backtest Complete",
        description: `Completed backtest for ${ticker.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Backtest Failed",
        description: error.message || "Failed to run backtest",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Run Backtest</CardTitle>
          <CardDescription>Test trading strategy on historical data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backtest-ticker">Ticker Symbol</Label>
            <Input
              id="backtest-ticker"
              placeholder="AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button onClick={handleBacktest} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Backtest
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Backtest Results</CardTitle>
            <CardDescription>{results.ticker} Performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Initial Capital</p>
                <p className="text-2xl font-bold">
                  ${parseFloat(results.initialCapital).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Final Value</p>
                <p className="text-2xl font-bold">
                  ${parseFloat(results.finalValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Return</p>
                <p className={`text-2xl font-bold ${parseFloat(results.totalReturn) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {parseFloat(results.totalReturn) >= 0 ? '+' : ''}{parseFloat(results.totalReturn).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold">{results.totalTrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};