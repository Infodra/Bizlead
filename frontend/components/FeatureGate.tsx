'use client';

import toast from 'react-hot-toast';
import { usePlanFeatures } from '@/lib/usePlanFeatures';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onGateOpen?: () => void;
}

export default function FeatureGate({
  feature,
  children,
  fallback,
  onGateOpen,
}: FeatureGateProps) {
  const { hasFeature, plan, canUpgrade } = usePlanFeatures();

  if (!hasFeature(feature)) {
    const handleUpgrade = () => {
      if (onGateOpen) {
        onGateOpen();
      }
      if (canUpgrade) {
        toast.success('Upgrade to unlock this feature!', {
          duration: 4000,
        });
      }
    };

    if (fallback) {
      return <div onClick={handleUpgrade}>{fallback}</div>;
    }

    return (
      <div
        onClick={handleUpgrade}
        className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center cursor-pointer hover:bg-yellow-100 transition-colors"
      >
        <p className="text-sm font-medium text-yellow-800 mb-2">
          🔒 This feature is not available on your {plan} plan
        </p>
        {canUpgrade && (
          <p className="text-sm text-yellow-700">
            Upgrade to unlock this feature
          </p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
