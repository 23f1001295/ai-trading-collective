import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export const TradeHistory = () => {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    fetchTrades();
    
    const channel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades'
        },
        () => fetchTrades()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrades = async () => {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('trade_date', { ascending: false })
      .limit(50);

    if (data) {
      setTrades(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
        <CardDescription>Recent trading activity</CardDescription>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No trades yet</p>
        ) : (
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  {trade.action === 'buy' && <ArrowUpRight className="h-5 w-5 text-success" />}
                  {trade.action === 'sell' && <ArrowDownRight className="h-5 w-5 text-destructive" />}
                  {trade.action === 'hold' && <Minus className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="font-semibold">{trade.ticker}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trade.trade_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      trade.action === 'buy' ? 'default' :
                      trade.action === 'sell' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {trade.action.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {parseFloat(trade.quantity).toFixed(2)} @ ${parseFloat(trade.price).toFixed(2)}
                  </p>
                  <p className="font-semibold">
                    ${parseFloat(trade.total_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};