/**
 * @see https://commitlint.js.org/reference/configuration.html
 */
const config = {
  $schema: "https://json.schemastore.org/commitlintrc.json",
  extends: ["@commitlint/config-conventional"] as const,
};

export default config;
