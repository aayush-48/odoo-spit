import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  BarChart3, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  TrendingUp,
  Users,
  Globe
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: 'Multi-Warehouse Management',
      description: 'Track inventory across multiple locations with real-time synchronization.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Gain insights with comprehensive reports and KPI dashboards.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for handling thousands of products.',
    },
    {
      icon: TrendingUp,
      title: 'Stock Optimization',
      description: 'Automated alerts for low stock levels and reorder points.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Manage users, assign roles, and track all inventory activities.',
    },
  ];

  const benefits = [
    'Real-time inventory tracking across all warehouses',
    'Automated stock level alerts and notifications',
    'Comprehensive receipt and delivery management',
    'Internal transfer tracking between locations',
    'Stock adjustment and reconciliation tools',
    'Detailed move history and audit trails',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
              <Package className="w-6 h-6 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              StockMaster
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-foreground hover:text-accent"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Professional Inventory Management
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
            Take Control of Your
            <span className="block bg-gradient-accent bg-clip-text text-transparent">
              Inventory Operations
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            A comprehensive, real-time inventory management system designed for modern businesses. 
            Track stock, manage receipts, deliveries, and transfers with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg h-14 px-8 gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg h-14 px-8 border-2"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features to streamline your inventory management workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover-lift border-2 border-border hover:border-accent/50 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
              Built for Scale,
              <span className="block text-accent">Designed for Simplicity</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              StockMaster replaces manual tracking with a centralized, real-time digital solution. 
              Perfect for inventory managers and warehouse staff who need efficiency and clarity.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-accent blur-3xl opacity-20 rounded-full"></div>
            <Card className="relative border-2 border-border shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Stock Value</p>
                      <p className="text-2xl font-display font-bold text-foreground">$2.4M</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Warehouses</p>
                      <p className="text-2xl font-display font-bold text-foreground">12</p>
                    </div>
                    <Globe className="w-8 h-8 text-accent" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div>
                      <p className="text-sm text-muted-foreground">Products Tracked</p>
                      <p className="text-2xl font-display font-bold text-foreground">45,892</p>
                    </div>
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-accent opacity-5"></div>
          <CardContent className="relative p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
              Ready to Transform Your Inventory?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of businesses managing their inventory with StockMaster.
              Start your free trial today.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg h-14 px-8 gap-2"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                <Package className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">StockMaster</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 StockMaster. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
