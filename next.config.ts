import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next writes agent instruction files at the repo root unless this is off.
  // The public repository carries no Markdown but its README.
  agentRules: false,
  async rewrites() {
    // The agent guide is served as plain text from a route handler.
    return [{ source: "/skill.md", destination: "/api/skill" }];
  },
};

export default nextConfig;
