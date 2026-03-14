import { useAuthStore } from './store';

// Feature permissions based on plan
const FEATURE_ACCESS = {
  starter: {
    basic_info: true,
    advanced_filters: true,
    csv_export: true,
    analytics: false,
    api_access: false,
    custom_segments: false,
  },
  professional: {
    basic_info: true,
    advanced_filters: true,
    csv_export: true,
    analytics: true,
    api_access: true,
    custom_segments: true,
  },
};

const PLAN_LIMITS = {
  starter: 500,
  professional: 2000,
};

export const usePlanFeatures = () => {
  const user = useAuthStore((state) => state.user);
  const plan = user?.plan || 'starter';

  return {
    plan,
    features: FEATURE_ACCESS[plan as keyof typeof FEATURE_ACCESS] || FEATURE_ACCESS.starter,
    leadLimit: PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.starter,
    hasFeature: (feature: string) => {
      const features = FEATURE_ACCESS[plan as keyof typeof FEATURE_ACCESS] || FEATURE_ACCESS.starter;
      return features[feature as keyof typeof features] || false;
    },
    canUpgrade: plan !== 'professional',
  };
};
