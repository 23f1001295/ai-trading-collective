import { Button } from "@/components/ui/button";
import { TrendingUp, Brain, BarChart3, Shield, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container relative mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <TrendingUp className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              AI-Powered <span className="text-primary">Hedge Fund</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Harness the power of multiple AI agents working together to analyze markets, 
              manage risk, and execute sophisticated trading strategies.
            </p>
            <div className="flex gap-4 justify-center pt-8">
              <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')}>
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Multi-Agent Intelligence
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="Sentiment Analysis"
              description="AI agent analyzes news, social media, and market sentiment to gauge investor psychology"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Fundamental Analysis"
              description="Deep dive into financial statements, ratios, and company fundamentals"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Quantitative Analysis"
              description="Mathematical models identify patterns and statistical trading signals"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Risk Management"
              description="Sophisticated risk controls and position sizing for portfolio protection"
            />
            <FeatureCard
              icon={<Target className="h-8 w-8" />}
              title="Portfolio Optimization"
              description="AI-driven decision making balances all signals for optimal execution"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Backtesting Engine"
              description="Test strategies on historical data before deploying real capital"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 bg-card p-12 rounded-lg border border-border">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join the future of algorithmic trading with AI-powered multi-agent systems
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
              Start Trading <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
    <div className="text-primary mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;