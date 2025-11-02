export interface BusinessTypeOption {
  value: string
  label: string
}

export const BUSINESS_TYPE_OPTIONS: BusinessTypeOption[] = [
  { value: "medical", label: "Doctors' Office / Medical Clinic" },
  { value: "restaurant", label: "Restaurant" },
  { value: "barbers-salons", label: "Barbers & Salons" },
  { value: "residential", label: "Residential Building" },
  { value: "service-trade", label: "Service Trade Business" },
  { value: "reception-team", label: "Reception Team" },
  { value: "dry-cleaner", label: "Dry Cleaner" },
  { value: "other", label: "Other" },
]

const BUSINESS_TYPE_LABEL_MAP = BUSINESS_TYPE_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

export function getBusinessTypeLabel(value?: string | null): string {
  if (!value) {
    return ""
  }

  const normalizedValue = value.trim()
  if (!normalizedValue) {
    return ""
  }

  if (BUSINESS_TYPE_LABEL_MAP[normalizedValue]) {
    return BUSINESS_TYPE_LABEL_MAP[normalizedValue]
  }

  // Fallback: convert slug/identifier into a human-readable label
  return normalizedValue
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}
