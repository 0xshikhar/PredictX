"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, TrendingUp, BarChart3, Bot, Briefcase, Zap } from "lucide-react";
import Link from "next/link";

/**
 * Main dashboard landing page
 */
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Signal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="clean-section">
        <div className="clean-container">
          <div className="text-center space-y-6">
            <h1 className="text-display text-gray-900">
              Welcome to <span className="text-blue-600">Signal</span>
            </h1>
            <p className="text-subheading text-gray-700 max-w-3xl mx-auto">
              Advanced DeFi analytics platform for modern investors. Get insights, manage portfolios, and make informed decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/agent/chat"
                className="clean-button-primary px-8 py-3 rounded-lg font-semibold text-lg hover:shadow-clean-lg transition-all inline-flex items-center gap-2"
              >
                Start Chatting
                <ArrowRight size={20} />
              </Link>
              <Link 
                href="/portfolio"
                className="clean-button px-8 py-3 rounded-lg font-semibold text-lg hover:shadow-clean-md transition-all"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="clean-section bg-white">
        <div className="clean-container">
          <div className="text-center mb-16">
            <h2 className="text-heading text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-body text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in DeFi, from AI-powered insights to comprehensive portfolio management.
            </p>
          </div>

          <div className="clean-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* AI Chat */}
            <div className="clean-card clean-card-hover p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Assistant</h3>
              <p className="text-gray-600 mb-6">
                Get instant answers to your DeFi questions with our intelligent AI agent.
              </p>
              <Link 
                href="/agent/chat"
                className="clean-button-primary px-6 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
              >
                Start Chat
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Portfolio Management */}
            <div className="clean-card clean-card-hover p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Portfolio Tracking</h3>
              <p className="text-gray-600 mb-6">
                Monitor your investments across multiple chains with real-time updates.
              </p>
              <Link 
                href="/portfolio"
                className="clean-button-primary px-6 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
              >
                View Portfolio
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Research & Analytics */}
            <div className="clean-card clean-card-hover p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Research Tools</h3>
              <p className="text-gray-600 mb-6">
                Access comprehensive market data and research insights for informed decisions.
              </p>
              <Link 
                href="/research"
                className="clean-button-primary px-6 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
              >
                Explore Research
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Strategy Builder */}
            <div className="clean-card clean-card-hover p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={32} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Strategy Builder</h3>
              <p className="text-gray-600 mb-6">
                Create and backtest DeFi strategies with our advanced tools.
              </p>
              <Link 
                href="/strategy"
                className="clean-button-primary px-6 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
              >
                Build Strategy
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Risk Assessment */}
            <div className="clean-card clean-card-hover p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Risk Analysis</h3>
              <p className="text-gray-600 mb-6">
                Assess portfolio risk and get recommendations for optimization.
              </p>
              <Link 
                href="/research/risk-assessment"
                className="clean-button-primary px-6 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
              >
                Analyze Risk
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* DeFi Allocation */}
            <div className="clean-card clean-card-hover p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">DeFi Allocation</h3>
              <p className="text-gray-600 mb-6">
                Optimize your DeFi portfolio with intelligent allocation strategies.
              </p>
              <Link 
                href="/defi/generate-allocation"
                className="clean-button-primary px-6 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
              >
                Generate Allocation
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="clean-section">
        <div className="clean-container">
          <div className="text-center">
            <div className="clean-card max-w-2xl mx-auto p-12 text-center">
              <h2 className="text-heading text-gray-900 mb-4">Ready to Get Started?</h2>
              <p className="text-body text-gray-600 mb-8">
                Join thousands of investors who trust Signal for their DeFi analytics and portfolio management needs.
              </p>
              <Link 
                href="/agent/chat"
                className="clean-button-primary px-8 py-3 rounded-lg font-semibold text-lg hover:shadow-clean-lg transition-all inline-flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
