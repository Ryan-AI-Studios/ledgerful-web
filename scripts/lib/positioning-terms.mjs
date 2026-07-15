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

// Terms that are allowed when they appear as part of a web platform API name
// (e.g. window.crypto / crypto.subtle) or as the name of an engine track
// (E1-CRYPTO, crypto test isolation, crypto path refs) but not as standalone
// marketing copy.
export const apiContextAllowlist = Object.freeze([
  "window.crypto",
  "crypto.subtle",
  "crypto.subtle.importKey",
  "crypto.subtle.verify",
  "E1-CRYPTO",
  "crypto test isolation",
  "crypto path refs",
  "WebCrypto",
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
  const allowlistedPatterns = apiContextAllowlist.map((term) => ({
    term,
    pattern: new RegExp(term.replace(/\./g, "\\."), "i"),
  }));

  for (const file of files) {
    const lines = file.content.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const { term, pattern } of termPatterns) {
        if (!pattern.test(line)) continue;
        // Allow the term when it appears only as part of a web platform API
        // context (e.g. window.crypto, crypto.subtle). Remove all allowed
        // substrings; if the banned term no longer matches, skip the line.
        let scrubbed = line;
        for (const { pattern: allowPattern } of allowlistedPatterns) {
          scrubbed = scrubbed.replace(allowPattern, "__allowed__");
        }
        if (pattern.test(scrubbed)) {
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
