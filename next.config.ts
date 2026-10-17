import type { NextConfig } from "next";

// Evaluate the public configuration at build time. A missing or
// malformed required variable throws here, failing `npm run build` with a
// message naming the variable rather than surfacing at a call site.
import { publicConfig } from "./src/lib/config/public";

// Reference the validated config so tree-shaking cannot drop the
// validation side effects during the build.
void publicConfig;

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
