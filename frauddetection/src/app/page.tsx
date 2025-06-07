import Link from "next/link"
import { ArrowRight, Shield, Brain, TrendingDown, AlertTriangle, CheckCircle, Eye, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Detection",
      description:
        "Advanced machine learning algorithms analyze claims patterns to identify potential fraud with 95% accuracy",
    },
    {
      icon: Eye,
      title: "Real-Time Analysis",
      description: "Instant claim evaluation and risk scoring as soon as claims are submitted to your system",
    },
    {
      icon: BarChart3,
      title: "Comprehensive Analytics",
      description: "Detailed insights into fraud patterns, trends, and financial impact across your entire portfolio",
    },
    {
      icon: AlertTriangle,
      title: "Smart Alerts",
      description: "Automated notifications for high-risk claims with detailed reasoning and recommended actions",
    },
  ]

  const benefits = [
    "Reduce fraudulent claims by up to 40%",
    "Save millions in false payouts annually",
    "Improve claim processing efficiency by 60%",
    "Real-time risk assessment and scoring",
    "Seamless integration with existing systems",
    "Comprehensive audit trails and reporting",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">ClaimGuard AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Request Demo</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Stop Insurance Fraud with{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AI Intelligence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Advanced AI-powered fraud detection system that helps insurance companies identify suspicious claims,
              reduce losses, and protect their bottom line with unprecedented accuracy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/signup">
                Request Free Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="/login">Access Portal</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Enterprise security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Advanced Fraud Detection Technology</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cutting-edge AI algorithms trained on millions of insurance claims to detect even the most sophisticated
            fraud attempts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Protect Your <span className="text-primary">Bottom Line</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Insurance fraud costs the industry billions annually. Our AI-powered solution helps you fight back with
                intelligent detection and prevention capabilities.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Start Protecting Your Claims
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8">
                <div className="bg-white rounded-xl shadow-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="font-medium">High Risk Claim Detected</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium">AI Analysis Complete</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium">Fraud Risk: 87% Confidence</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Claims Processed Today</span>
                      <span className="text-primary font-medium">2,847</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Fraud Detected</span>
                      <span className="text-red-600 font-medium">23 Claims</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Stop Fraud in Its Tracks?</h2>
            <p className="text-xl opacity-90">
              Join leading insurance companies who trust ClaimGuard AI to protect their claims and reduce fraud losses.
              See the difference AI can make for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                <Link href="/signup">
                  Schedule Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary"
                asChild
              >
                <Link href="/login">Access Portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-white">ClaimGuard AI</span>
              </div>
              <p className="text-slate-400">
                Advanced AI-powered fraud detection for insurance companies. Protect your claims, reduce losses, and
                improve efficiency.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Solutions</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/auto-insurance" className="hover:text-white transition-colors">
                    Auto Insurance
                  </Link>
                </li>
                <li>
                  <Link href="/property" className="hover:text-white transition-colors">
                    Property Insurance
                  </Link>
                </li>
                <li>
                  <Link href="/health" className="hover:text-white transition-colors">
                    Health Insurance
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/case-studies" className="hover:text-white transition-colors">
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-white transition-colors">
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ClaimGuard AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
