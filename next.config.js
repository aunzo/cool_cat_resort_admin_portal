/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14
  webpack: (config, { dev }) => {
    if (dev) {
      // Suppress Material-UI deprecation warnings
      const originalWarn = console.warn;
      console.warn = (...args) => {
        if (args[0] && args[0].includes('MuiPickersSlideTransitionRoot')) {
          return;
        }
        originalWarn.apply(console, args);
      };
    }
    return config;
  },
}

module.exports = nextConfig