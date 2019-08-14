module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["build", "ci", "docs", "feat", "fix", "perf", "refactor", "style", "test"]],
  },
};
