import type { VersionedRuleMeta } from "../types.js";

const normalizeVersion = (versionRange: string): string => {
  const match = versionRange.match(/\d+\.\d+\.\d+/);
  return match ? match[0] : "0.0.0";
};

const compareVersions = (a: string, b: string): number => {
  const aParts = a.split(".").map((part) => Number(part));
  const bParts = b.split(".").map((part) => Number(part));

  for (let index = 0; index < 3; index += 1) {
    const delta = (aParts[index] ?? 0) - (bParts[index] ?? 0);
    if (delta !== 0) return delta;
  }
  return 0;
};

export const ruleEnabledForVersion = (
  meta: VersionedRuleMeta,
  detectedVersionRange: string,
): boolean => {
  const detected = normalizeVersion(detectedVersionRange);

  if (meta.minVersion && compareVersions(detected, meta.minVersion) < 0) return false;
  if (meta.maxVersion && compareVersions(detected, meta.maxVersion) > 0) return false;
  return true;
};
