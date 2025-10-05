'use client'

import { useAuth } from '@clerk/nextjs'
import { Check } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { billingApi } from '@/lib/api'

export default function Pricing() {
  const { isSignedIn, getToken } = useAuth()

  const handleSubscribe = async (priceId: string) => {
    if (!isSignedIn) {
      alert('Please sign in to subscribe')
      return
    }

    try {
      const token = await getToken()
      if (!token) return
      
      const { url } = await billingApi.createCheckoutSession(priceId, token)
      window.location.href = url
    } catch (error) {
      console.error('Checkout failed:', error)
      alert('Failed to start checkout')
    }
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      priceId: 'free',
      features: [
        '5 meetings per month',
        'Audio & video transcription',
        'AI-powered summaries',
        'Action item extraction',
        'JSON export',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$19',
      priceId: 'price_pro_monthly',
      features: [
        'Unlimited meetings',
        'Audio & video transcription',
        'AI-powered summaries',
        'Action item extraction',
        'All export options (JSON, Slack, Email)',
        'Priority processing',
        'Advanced analytics',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      priceId: 'price_enterprise_monthly',
      features: [
        'Everything in Pro',
        'Custom integrations',
        'Team collaboration',
        'SSO authentication',
        'Dedicated support',
        'Custom AI models',
        'API access',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Get started with AI-powered meeting summaries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-md p-8 relative ${
                plan.popular ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.price !== '$0' && (
                    <span className="text-gray-600">/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="text-green-500 mr-3 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </div>
  )
}
