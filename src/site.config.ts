export const siteConfig = {
  // ── Identity ───────────────────────────────────────────────────────────────
  businessName:   "Vallejo Pest Pros",
  tagline:        "Same-day pest control in Vallejo — ants, rats, and roaches gone fast",
  niche:          "pest-control",
  primaryCity:    "Vallejo",
  state:          "CA",
  phone:          "+1-PLACEHOLDER-TWILIO",   // replace with Twilio tracking number
  email:          "leads@vallejopestpros.com",

  // ── Geography ──────────────────────────────────────────────────────────────
  serviceArea:    [
    "Vallejo", "Benicia", "American Canyon", "Napa", "Fairfield", "Suisun City",
  ],
  addressStreet:  "Vallejo, CA",
  addressZip:     "94590",

  // ── Services ───────────────────────────────────────────────────────────────
  services: [
    "General Pest Control",
    "Ant Control",
    "Rodent Control",
    "Cockroach Treatment",
    "Termite Inspection & Treatment",
  ],

  // ── Trust proof points ─────────────────────────────────────────────────────
  trust: {
    responseTime:    "Same-day service available",
    yearsInBusiness: 0,
    certifications:  "CA SPCB Licensed — Branch 2 & 3",
    guarantee:       "Free re-treatment if pests return",
  },

  // ── Call tracking (Twilio) ─────────────────────────────────────────────────
  twilio: {
    accountSid:     "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // fill after Twilio setup
    forwardToPhone: "+1-PLACEHOLDER-FORWARD",              // tenant's real number
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  ga4MeasurementId: "G-XXXXXXXXXX",

  // ── Design ────────────────────────────────────────────────────────────────
  accentColor: "#2d6a4f",   // pest control = forest green

  // ── Schema.org ────────────────────────────────────────────────────────────
  schema: {
    businessType: "PestControlService",
    priceRange:   "$$",
    areaServed:   "Vallejo, CA and surrounding Solano County",
    openingHours: "Mo-Su 07:00-19:00",
  },

  // ── Portfolio agent metadata ───────────────────────────────────────────────
  portfolioId:      "vallejo-pest-pros",
  semrushProjectId: "",
  gbpLocationId:    "",
} as const;

export type SiteConfig = typeof siteConfig;
