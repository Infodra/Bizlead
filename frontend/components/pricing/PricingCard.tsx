'use client';

interface PricingFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface AIFeature {
  name: string;
  description: string;
}

interface PricingCardProps {
  name: string;
  price: string;
  monthlyPrice?: string;
  annualPrice?: string;
  leadsPerMonth: string;
  features: PricingFeature[];
  aiFeatures?: AIFeature[];
  isPopular?: boolean;
  isHighlighted?: boolean;
  isAnnual?: boolean;
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary' | 'contact';
  onGetStarted?: () => void;
  onExploreAI?: () => void;
}

export function PricingCard({
  name,
  price,
  monthlyPrice,
  annualPrice,
  leadsPerMonth,
  features,
  aiFeatures = [],
  isPopular = false,
  isHighlighted = false,
  isAnnual = false,
  buttonText = "Contact Sales",
  buttonVariant = 'secondary',
  onGetStarted,
  onExploreAI,
}: PricingCardProps) {
  // Display the appropriate price based on billing period
  const displayPrice = isAnnual && annualPrice ? annualPrice : monthlyPrice || price;
  const billingPeriod = isAnnual ? '/year' : '/month';

  return (
    <div
      className={`relative rounded-2xl p-8 border backdrop-blur-lg transition-all duration-300 group flex flex-col ${
        isHighlighted
          ? "border-slate-700 bg-slate-900/70 md:scale-105 hover:-translate-y-1 hover:shadow-xl shadow-[0_0_40px_rgba(59,130,246,0.25)]"
          : "border-slate-800 bg-slate-900/70 hover:-translate-y-1 hover:shadow-xl hover:border-slate-700"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="inline-block bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <h3 className="text-xl font-semibold text-white mb-4">{name}</h3>

      <div className="mb-6">
        {isHighlighted ? (
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {displayPrice}
          </div>
        ) : (
          <span className="text-4xl font-bold text-white">{displayPrice}</span>
        )}
        {name !== 'Enterprise' && (
          <p className="text-slate-400 mt-2 text-sm">{billingPeriod}</p>
        )}
        <p className="text-slate-400 mt-3 text-sm">{leadsPerMonth}</p>
      </div>

      {/* Features Section */}
      <div className="flex-1 mb-8">
        {aiFeatures && aiFeatures.length > 0 && (
          <div className="mb-6 pb-6 border-b border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
              Core Enterprise Features
            </h4>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-slate-300"
                >
                  {feature.included ? (
                    <svg
                      className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className={feature.included ? "text-slate-300" : "text-slate-500"}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!aiFeatures || aiFeatures.length === 0 ? (
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-slate-300"
              >
                {feature.included ? (
                  <svg
                    className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className={feature.included ? "text-slate-300" : "text-slate-500"}>
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {aiFeatures && aiFeatures.length > 0 && (
          <button
            onClick={onExploreAI}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 rounded-lg text-cyan-300 font-semibold hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.657 14.243a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM11 17a1 1 0 102 0v-1a1 1 0 10-2 0v1zM5.757 15.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zM5.757 4.343a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z" />
            </svg>
            Explore AI Features
          </button>
        )}
      </div>

      {name !== 'Enterprise' && (
        <button
          onClick={onGetStarted}
          className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
            buttonVariant === 'primary'
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 shadow-lg"
              : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90 shadow-lg"
          }`}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
