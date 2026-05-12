import storkReact from "@stork/eslint-config/react";

export default [
  { ignores: ["dist", "node_modules", ".turbo"] },
  ...storkReact,
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
