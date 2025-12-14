// config/client.ts
// ============================================================================
// CLIENT CONFIGURATION - Single Source of Truth
// ============================================================================

export const clientConfig = {
  // ==========================================================================
  // PLATFORM INFORMATION
  // ==========================================================================
  platform: {
    name: "AI Agent Interviews",
    tagline: "AI-Powered Research Interview Platform",
    description: "Conduct structured research interviews with AI assistance. Validate ideas, gather insights, and analyse results at scale.",
    version: "1.0.0",
  },

  // ==========================================================================
  // COMPANY INFORMATION
  // ==========================================================================
  company: {
    name: "RaiseReady",
    legalName: "Global Buildtech Australia Pty Ltd",
    website: "https://raiseready.com",
    supportEmail: "support@raiseready.com",
    
    social: {
      linkedin: "https://linkedin.com/company/raiseready",
      twitter: "https://twitter.com/raiseready",
    },
  },

  // ==========================================================================
  // INTERVIEW CONFIGURATION
  // ==========================================================================
  interview: {
    // Default interviewer persona
    defaultPersona: `You are professional, warm, and genuinely curious. You're conducting research, not selling.
Your tone is conversational but respectful of the interviewee's time and expertise.
You're here to learn and understand their perspective.`,

    // Default consent requirements
    defaultConsent: [
      "I consent to this interview being recorded and analysed",
      "I consent to anonymised quotes being used in research findings",
      "I understand I can stop the interview at any time",
    ],

    // Time settings
    maxDurationMins: 45,
    warningAtMins: 35,
    
    // AI model settings
    aiModel: "claude-sonnet-4-20250514",
    maxTokens: 4096,
    temperature: 0.7,
  },

  // ==========================================================================
  // THEME & BRANDING
  // ==========================================================================
  theme: {
    mode: "dark" as "dark" | "light",
    colors: {
      primary: "#8B5CF6",      // Purple
      primaryHover: "#7C3AED",
      accent: "#10B981",       // Emerald
      accentHover: "#059669",
      background: "#0F172A",
      surface: "#1E293B",
      text: "#F8FAFC",
      textMuted: "#94A3B8",
      border: "#334155",
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#EF4444",
    },
  },

  // ==========================================================================
  // FEATURE TOGGLES
  // ==========================================================================
  features: {
    enableAnalytics: true,
    enableExport: true,
    enableVideoRecording: false,
    enableAudioRecording: false,
    enableRealTimeAnalysis: true,
    enableBatchAnalysis: true,
  },

  // ==========================================================================
  // EXTERNAL SERVICES
  // ==========================================================================
  services: {
    supabase: {
      // Keys stored in env vars
    },
    anthropic: {
      // Key stored in env vars
    },
  },
};

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

export const getPlatformName = () => clientConfig.platform.name;
export const getCompanyName = () => clientConfig.company.name;
export const getDefaultPersona = () => clientConfig.interview.defaultPersona;
export const getAIModel = () => clientConfig.interview.aiModel;

export const isFeatureEnabled = (feature: keyof typeof clientConfig.features) =>
  clientConfig.features[feature];

export type ClientConfig = typeof clientConfig;
