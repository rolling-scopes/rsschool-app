type Toggles = ReturnType<typeof getInitialFeatureToggles>;
export type FeatureName = keyof Toggles;

export let featureToggles: Toggles = getInitialFeatureToggles();

export function initializeFeatures(query: Record<string, string | string[] | undefined>): void {
  featureToggles = getInitialFeatureToggles();
  for (const key in featureToggles) {
    const featureName = key as FeatureName;
    const value = query[featureName] as string;

    featureToggles[featureName] = value ? value === 'on' : featureToggles[key as FeatureName];
  }
}

function getInitialFeatureToggles() {
  return {
    notifications: false,
    adminMessenger: false,
  };
}
