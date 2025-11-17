import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp } from "lucide-react";

export const PortfolioOverview = () => {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalValue: 100000,
    cash: 100000,
    holdings: 0,
    return: 0,
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    const { data: portfolioData } = await supabase
      .from('portfolio')
      .select('*')
      .order('last_updated', { ascending: false });

    if (portfolioData && portfolioData.length > 0) {
      setPortfolio(portfolioData);
      const latest = portfolioData[0];
      const totalValue = typeof latest.total_value === 'string' ? parseFloat(latest.total_value) : latest.total_value;
      const cashBalance = typeof latest.cash_balance === 'string' ? parseFloat(latest.cash_balance) : latest.cash_balance;
      const totalReturn = ((totalValue - 100000) / 100000) * 100;
      
      setStats({
        totalValue,
        cash: cashBalance,
        holdings: totalValue - cashBalance,
        return: totalReturn,
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Holdings Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.holdings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          {stats.return >= 0 ? (
            <ArrowUpRight className="h-4 w-4 text-success" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.return >= 0 ? 'text-success' : 'text-destructive'}`}>
            {stats.return >= 0 ? '+' : ''}{stats.return.toFixed(2)}%
          </div>
        </CardContent>
      </Card>

      {portfolio.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Current Holdings</CardTitle>
            <CardDescription>Your active positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.map((holding) => (
                <div key={holding.id} className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="font-semibold">{holding.ticker}</p>
                    <p className="text-sm text-muted-foreground">
                      {parseFloat(holding.quantity).toFixed(2)} shares @ ${parseFloat(holding.average_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(parseFloat(holding.quantity) * parseFloat(holding.average_price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};