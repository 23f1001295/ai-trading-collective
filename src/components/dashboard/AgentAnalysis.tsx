import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, BarChart3, Shield, Activity, Target } from "lucide-react";

interface AgentAnalysisProps {
  ticker: string;
}

const agentIcons: Record<string, any> = {
  market_data: Activity,
  sentiment: Brain,
  fundamentals: BarChart3,
  quant: TrendingUp,
  risk: Shield,
  portfolio: Target,
};

const agentNames: Record<string, string> = {
  market_data: "Market Data Analyst",
  sentiment: "Sentiment Analyst",
  fundamentals: "Fundamentals Analyst",
  quant: "Quant Analyst",
  risk: "Risk Manager",
  portfolio: "Portfolio Manager",
};

export const AgentAnalysis = ({ ticker }: AgentAnalysisProps) => {
  const [analyses, setAnalyses] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyses();
    
    const channel = supabase
      .channel('agent-analysis-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_analysis'
        },
        () => fetchAnalyses()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticker]);

  const fetchAnalyses = async () => {
    const { data } = await supabase
      .from('agent_analysis')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .order('analyzed_at', { ascending: false })
      .limit(6);

    if (data) {
      setAnalyses(data);
    }
  };

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analysis Available</CardTitle>
          <CardDescription>Analyze a stock to see AI agent insights</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {analyses.map((analysis) => {
        const Icon = agentIcons[analysis.agent_type] || Brain;
        const confidence = parseFloat(analysis.confidence || 0);
        
        return (
          <Card key={analysis.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {agentNames[analysis.agent_type]}
                </CardTitle>
                <Badge variant={confidence > 0.7 ? "default" : confidence > 0.5 ? "secondary" : "outline"}>
                  {(confidence * 100).toFixed(0)}%
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {new Date(analysis.analyzed_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recommendation && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Recommendation</p>
                    <Badge 
                      variant={
                        analysis.recommendation.toLowerCase().includes('buy') ? 'default' :
                        analysis.recommendation.toLowerCase().includes('sell') ? 'destructive' :
                        'secondary'
                      }
                      className="mt-1"
                    >
                      {analysis.recommendation}
                    </Badge>
                  </div>
                )}
                {analysis.reasoning && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Reasoning</p>
                    <p className="text-sm">{analysis.reasoning}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};