// config/site.ts
// Site metadata configuration

export const siteConfig = {
  name: "AI Agent Interviews",
  description: "AI-Powered Research Interview Platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/raiseready/ai-agent-interviews",
  },
};

export type SiteConfig = typeof siteConfig;
