/**
 * Onboarding Payload Normalizer
 * Ensures Next.js form data matches backend Pydantic schema requirements
 */

interface NormalizedPayload {
  tenant: {
    legalName: string;
    brandName: string;
    timezone: string;
    phone: string;
    email: string;
    address: {
      city: string;
      state: string;
      country: string;
    };
    plan: {
      tier: string;
      setupFeeApproved: boolean;
      monthly: number;
      paymentMethod: string;
      terms: string;
    };
  };
  contacts: {
    owner: {
      name: string;
      title: string;
      email: string;
      mobile: string;
      preferredContact: string;
    };
    redirect: {
      name: string;
      title: string;
      email: string;
      phone: string;
      responsibilities: string[];
    };
    billing: {
      name: string;
      title: string;
      email: string;
      phone: string;
      address: string;
    };
  };
  hours: Array<{
    day: string;
    isOpen: boolean;
    open: string | null;
    close: string | null;
  }>;
  rules: {
    minLeadHours: number;
    maxLeadDays: number;
    sameDay: boolean;
    sameDayCutoff: string | null;
    cancelWindowHours: number;
    noShowPolicy: {
      type: string;
      value: number;
    };
  };
  services: Array<{
    name: string;
    duration: number;
    price: number;
    category: string;
    bufferBeforeMin: number;
    bufferAfterMin: number;
  }>;
  staff: Array<{
    name: string;
    email: string;
    phone: string;
    role: string;
    specialties: string[];
    isActive: boolean;
  }>;
  phone: {
    currentNumber: string;
    action: string;
    afterHours: string;
    onCallNumber: string;
  };
  calendar: {
    provider: string;
  };
  consent: {
    smsClient: boolean;
    dataShare: boolean;
  };
  website: {
    slug: string;
    bookingPath: string;
    publicUrl: string;
  };
  goLiveDate: string;
  status: string;
}

/**
 * Normalize day names to backend format
 */
function normalizeDayName(day: string): string {
  const dayMap: { [key: string]: string } = {
    'monday': 'Mon',
    'tuesday': 'Tue', 
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };
  return dayMap[day.toLowerCase()] || day;
}

/**
 * Normalize hours object to backend format
 */
function normalizeHours(hours: any[]): Array<{
  day: string;
  isOpen: boolean;
  open: string | null;
  close: string | null;
}> {
  if (!Array.isArray(hours)) return [];
  
  return hours.map(hour => ({
    day: normalizeDayName(hour.day),
    isOpen: Boolean(hour.isOpen),
    open: hour.isOpen ? (hour.openTime || hour.open) : null,
    close: hour.isOpen ? (hour.closeTime || hour.close) : null
  }));
}

/**
 * Normalize services to backend format
 */
function normalizeServices(services: any[]): Array<{
  name: string;
  duration: number;
  price: number;
  category: string;
  bufferBeforeMin: number;
  bufferAfterMin: number;
}> {
  if (!Array.isArray(services)) return [];
  
  return services.map(service => ({
    name: service.name || '',
    duration: Number(service.duration) || 30,
    price: Number(service.price) || 0,
    category: service.category || 'Hair',
    bufferBeforeMin: Number(service.bufferBeforeMin) || 0,
    bufferAfterMin: Number(service.bufferAfterMin) || 0
  }));
}

/**
 * Normalize staff to backend format
 */
function normalizeStaff(staff: any[]): Array<{
  name: string;
  email: string;
  phone: string;
  role: string;
  specialties: string[];
  isActive: boolean;
}> {
  if (!Array.isArray(staff)) return [];
  
  return staff.map(member => ({
    name: member.name || '',
    email: member.email || '',
    phone: member.phone || '',
    role: member.role || 'barber',
    specialties: Array.isArray(member.specialties) ? member.specialties : [],
    isActive: Boolean(member.isActive)
  }));
}

/**
 * Normalize preferred contact method
 */
function normalizePreferredContact(pref: string): string {
  // Backend expects: email, sms, phone
  const mapping: { [key: string]: string } = {
    'mobile': 'sms',
    'phone': 'phone',
    'email': 'email',
    'sms': 'sms'
  };
  
  const normalized = mapping[pref.toLowerCase()] || 'phone';
  return normalized;
}

/**
 * Normalize no-show policy type
 */
function normalizeNoShowPolicyType(type: string): string {
  // Backend expects: none, fee, block
  const mapping: { [key: string]: string } = {
    'none': 'none',
    'fixed': 'fee',
    'percent': 'fee',
    'fee': 'fee',
    'block': 'block'
  };
  
  const normalized = mapping[type.toLowerCase()] || 'none';
  return normalized;
}

/**
 * Normalize billing address
 */
function normalizeBillingAddress(address: string, tenantAddress?: any): string {
  if (address && address.trim() && address !== 'N/A') {
    return address.trim();
  }
  
  // Construct from tenant address if available
  if (tenantAddress) {
    const parts = [
      tenantAddress.city,
      tenantAddress.state,
      tenantAddress.country
    ].filter(Boolean);
    
    if (parts.length > 0) {
      return parts.join(', ');
    }
  }
  
  return 'N/A';
}

/**
 * Normalize website data
 */
function normalizeWebsite(website: any, slug?: string): {
  slug: string;
  bookingPath: string;
  publicUrl: string;
} {
  const websiteSlug = website?.slug || slug || 'book-now';
  const cleanSlug = websiteSlug.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
  
  return {
    slug: cleanSlug,
    bookingPath: `/book/${cleanSlug}`,
    publicUrl: `https://app.avellabooking.com/book/${cleanSlug}`
  };
}

/**
 * Normalize phone data
 */
function normalizePhone(phone: any): {
  currentNumber: string;
  action: string;
  afterHours: string;
  onCallNumber: string;
} {
  return {
    currentNumber: phone?.currentNumber || phone?.businessPhone || '',
    action: phone?.action || 'keep',
    afterHours: phone?.afterHours || 'ai',
    onCallNumber: phone?.onCallNumber || phone?.onCall || ''
  };
}

/**
 * Normalize go-live date to YYYY-MM-DD format
 */
function normalizeGoLiveDate(date: string | Date): string {
  if (!date) {
    // Default to 30 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    return futureDate.toISOString().split('T')[0];
  }
  
  if (typeof date === 'string') {
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // Try to parse and format
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  
  // Fallback to 30 days from now
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  return futureDate.toISOString().split('T')[0];
}

/**
 * Main normalization function
 */
export function normalizeOnboardingPayload(formData: any): NormalizedPayload {
  // Ensure we have the basic structure
  const tenant = formData.tenant || {};
  const contacts = formData.contacts || {};
  const plan = formData.plan || {};
  
  return {
    tenant: {
      legalName: tenant.legalName || '',
      brandName: tenant.brandName || '',
      timezone: tenant.timezone || 'America/New_York',
      phone: tenant.phone || '',
      email: tenant.email || '',
      address: {
        city: tenant.address?.city || '',
        state: tenant.address?.state || '',
        country: tenant.address?.country || 'United States'
      },
      plan: {
        tier: plan.tier || 'Starter',
        setupFeeApproved: Boolean(plan.setupFeeApproved),
        monthly: Number(plan.monthly) || 0,
        paymentMethod: plan.paymentMethod || 'card',
        terms: plan.terms || 'NET0'
      }
    },
    contacts: {
      owner: {
        name: contacts.owner?.name || '',
        title: contacts.owner?.title || '',
        email: contacts.owner?.email || '',
        mobile: contacts.owner?.mobile || contacts.owner?.phone || '',
        preferredContact: normalizePreferredContact(
          contacts.owner?.preferredContact || contacts.owner?.pref || 'phone'
        )
      },
      redirect: {
        name: contacts.redirect?.name || contacts.owner?.name || '',
        title: contacts.redirect?.title || '',
        email: contacts.redirect?.email || contacts.owner?.email || '',
        phone: contacts.redirect?.phone || contacts.owner?.phone || '',
        responsibilities: ['scheduling', 'pricing', 'ivr']
      },
      billing: {
        name: contacts.billing?.name || contacts.owner?.name || '',
        title: contacts.billing?.title || '',
        email: contacts.billing?.email || contacts.owner?.email || '',
        phone: contacts.billing?.phone || contacts.owner?.phone || '',
        address: normalizeBillingAddress(
          contacts.billing?.address || '',
          tenant.address
        )
      }
    },
    hours: normalizeHours(formData.businessHours || formData.hours || []),
    rules: {
      minLeadHours: Number(formData.bookingRules?.minimumNoticeHours || formData.rules?.minLeadHours || 2),
      maxLeadDays: Number(formData.bookingRules?.maximumAdvanceDays || formData.rules?.maxLeadDays || 60),
      sameDay: Boolean(formData.bookingRules?.allowSameDayBooking || formData.rules?.sameDay || false),
      sameDayCutoff: formData.bookingRules?.sameDayCutoff || formData.rules?.sameDayCutoff || null,
      cancelWindowHours: formData.bookingRules?.cancellationPolicy === '24_hours' ? 24 : 12,
      noShowPolicy: {
        type: normalizeNoShowPolicyType(formData.bookingRules?.noShowFeeType || formData.rules?.noShowFee?.type || 'none'),
        value: Number(formData.bookingRules?.noShowFeeValue || formData.rules?.noShowFee?.value || 0)
      }
    },
    services: normalizeServices(formData.services || []),
    staff: normalizeStaff(formData.staff || []),
    phone: normalizePhone(formData.phoneSettings || formData.phone || {}),
    calendar: {
      provider: formData.calendarSettings?.provider || formData.calendar?.provider || 'avella'
    },
    consent: {
      smsClient: Boolean(formData.consentSettings?.enableSMS || formData.consent?.smsClient || true),
      dataShare: Boolean(formData.consentSettings?.enableDataCollection || formData.consent?.dataShare || true)
    },
    website: normalizeWebsite(formData.websiteSettings || formData.website || {}, formData.websiteSettings?.websiteSlug),
    goLiveDate: normalizeGoLiveDate(formData.goLiveDate),
    status: 'provisioned'
  };
}

/**
 * Validate normalized payload before sending
 */
export function validateNormalizedPayload(payload: NormalizedPayload): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required tenant fields
  if (!payload.tenant.legalName.trim()) {
    errors.push('Business legal name is required');
  }
  if (!payload.tenant.phone.trim()) {
    errors.push('Business phone is required');
  }
  if (!payload.tenant.email.trim()) {
    errors.push('Business email is required');
  }
  
  // Required contact fields
  if (!payload.contacts.owner.name.trim()) {
    errors.push('Owner name is required');
  }
  if (!payload.contacts.owner.email.trim()) {
    errors.push('Owner email is required');
  }
  
  // Services and staff
  if (payload.services.length === 0) {
    errors.push('At least one service is required');
  }
  if (payload.staff.length === 0) {
    errors.push('At least one staff member is required');
  }
  
  // Website slug
  if (!payload.website.slug.trim()) {
    errors.push('Website slug is required');
  }
  
  // Validate email formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (payload.tenant.email && !emailRegex.test(payload.tenant.email)) {
    errors.push('Business email format is invalid');
  }
  if (payload.contacts.owner.email && !emailRegex.test(payload.contacts.owner.email)) {
    errors.push('Owner email format is invalid');
  }
  
  // Validate preferred contact method
  const validPreferredContacts = ['email', 'sms', 'phone'];
  if (!validPreferredContacts.includes(payload.contacts.owner.preferredContact)) {
    errors.push('Owner preferred contact must be email, sms, or phone');
  }
  
  // Validate no-show policy type
  const validNoShowTypes = ['none', 'fee', 'block'];
  if (!validNoShowTypes.includes(payload.rules.noShowPolicy.type)) {
    errors.push('No-show policy type must be none, fee, or block');
  }
  
  // Validate phone formats (basic)
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  if (payload.tenant.phone && !phoneRegex.test(payload.tenant.phone)) {
    errors.push('Business phone format is invalid');
  }
  
  // Validate go-live date
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(payload.goLiveDate)) {
    errors.push('Go-live date must be in YYYY-MM-DD format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Complete normalization and validation pipeline
 */
export function processOnboardingPayload(formData: any): { 
  payload: NormalizedPayload; 
  isValid: boolean; 
  errors: string[] 
} {
  const normalized = normalizeOnboardingPayload(formData);
  const validation = validateNormalizedPayload(normalized);
  
  return {
    payload: normalized,
    isValid: validation.isValid,
    errors: validation.errors
  };
}
