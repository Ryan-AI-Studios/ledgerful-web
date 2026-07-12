export const bannedPositioningTerms = Object.freeze([
  "blockchain",
  "web3",
  "smart contract",
  "wallet",
  "NFT",
  "on-chain",
  "tokenomics",
  "crypto",
  "immutable",
  "tamper-proof",
]);

const termPatterns = bannedPositioningTerms.map((term) => ({
  term,
  pattern:
    term === "smart contract"
      ? /\bsmart\s+contract\b/i
      : term === "on-chain"
        ? /\bon-chain\b/i
        : new RegExp(`\\b${term}\\b`, "i"),
}));

export function findPositioningViolations(files) {
  const violations = [];

  for (const file of files) {
    const lines = file.content.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const { term, pattern } of termPatterns) {
        if (pattern.test(line)) {
          violations.push({
            path: file.path,
            line: index + 1,
            term,
            excerpt: line.trim(),
          });
        }
      }
    });
  }

  return violations;
}
