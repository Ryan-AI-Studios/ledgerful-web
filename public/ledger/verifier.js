// Offline WebCrypto verifier for the public ledger bundle.
// External script (not inline) so production CSP script-src 'self' allows it
// when served from the site; also works from a downloaded directory via file://
// when the browser permits local fetch of sibling files.
(async function () {
  const statusEl = document.getElementById("status");
  const resultsEl = document.getElementById("results");

  if (!window.crypto || !window.crypto.subtle) {
    statusEl.textContent =
      "WebCrypto is unavailable in this browser. Use the CLI verifier instead.";
    return;
  }

  async function loadText(name) {
    const res = await fetch(name);
    if (!res.ok) throw new Error("Failed to load " + name + ": " + res.status);
    return res.text();
  }

  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  async function importEd25519PublicKey(rawBytes) {
    for (const alg of ["Ed25519", "NODE-ED25519"]) {
      try {
        return await window.crypto.subtle.importKey(
          "raw",
          rawBytes,
          { name: alg, namedCurve: alg },
          false,
          ["verify"],
        );
      } catch {
        // Try the next algorithm name.
      }
    }
    throw new Error("Ed25519 is not supported by this browser");
  }

  async function verifyEd25519(keyBytes, sigBytes, payloadBytes) {
    const key = await importEd25519PublicKey(keyBytes);
    return await window.crypto.subtle.verify(
      key.algorithm.name,
      key,
      sigBytes,
      payloadBytes,
    );
  }

  async function sha256Hex(data) {
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  try {
    const manifestText = await loadText("manifest.json");
    const manifest = JSON.parse(manifestText);
    const sigHex = manifest.signature;
    const pubHex = manifest.publicKey;

    let manifestValid = false;
    if (sigHex && pubHex) {
      const sigBytes = hexToBytes(sigHex);
      const pubBytes = hexToBytes(pubHex);
      const canonical = JSON.parse(JSON.stringify(manifest));
      canonical.signature = null;
      canonical.publicKey = null;
      canonical.publicKeyFingerprint = null;
      const canonicalText = JSON.stringify(canonical);
      manifestValid = await verifyEd25519(
        pubBytes,
        sigBytes,
        new TextEncoder().encode(canonicalText),
      );
    }

    const manifestStatus = document.createElement("p");
    manifestStatus.innerHTML =
      "<strong>Manifest:</strong> " +
      (manifestValid
        ? '<span class="valid">VALID</span>'
        : sigHex
          ? '<span class="invalid">INVALID</span>'
          : '<span class="unsigned">UNSIGNED</span>');
    resultsEl.appendChild(manifestStatus);

    const entriesText = await loadText("entries.ndjson");
    const expectedEntriesHash = manifest.entriesSha256;
    const actualEntriesHash = await sha256Hex(
      new TextEncoder().encode(entriesText),
    );
    const entriesHashMatch =
      expectedEntriesHash && expectedEntriesHash === actualEntriesHash;
    const entriesStatus = document.createElement("p");
    entriesStatus.innerHTML =
      "<strong>Entries:</strong> " +
      (entriesHashMatch
        ? '<span class="valid">MATCH</span> (' + actualEntriesHash + ")"
        : expectedEntriesHash
          ? '<span class="invalid">MISMATCH</span> (expected ' +
            expectedEntriesHash +
            ", got " +
            actualEntriesHash +
            ")"
          : '<span class="unsigned">NO HASH</span>');
    resultsEl.appendChild(entriesStatus);

    const lines = entriesText.split("\n").filter((line) => line.trim());

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML =
      "<tr><th>tx_id</th><th>category</th><th>summary</th><th>status</th></tr>";
    table.appendChild(thead);
    const tbody = document.createElement("tbody");

    let valid = 0;
    let invalid = 0;
    let unsigned = 0;

    for (const line of lines) {
      const entry = JSON.parse(line);
      const key = entry.public_key ? hexToBytes(entry.public_key) : null;
      const sig = entry.signature ? hexToBytes(entry.signature) : null;
      const basis =
        "tx_id:" +
        entry.tx_id +
        "\ncategory:" +
        (entry.category ?? "") +
        "\nsummary:" +
        (entry.summary ?? "") +
        "\nreason:" +
        (entry.reason ?? "") +
        "\ncommitted_at:" +
        (entry.committed_at ?? "");
      const payload = new TextEncoder().encode(basis);
      let label = "UNSIGNED";
      if (key && sig) {
        try {
          const entryValid = await verifyEd25519(key, sig, payload);
          label = entryValid ? "VALID" : "INVALID";
        } catch {
          label = "INVALID";
        }
      }
      if (label === "VALID") valid += 1;
      else if (label === "INVALID") invalid += 1;
      else unsigned += 1;
      const cls =
        label === "VALID" ? "valid" : label === "INVALID" ? "invalid" : "unsigned";
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        entry.tx_id +
        "</td><td>" +
        (entry.category || "") +
        "</td><td>" +
        (entry.summary || "") +
        '</td><td class="' +
        cls +
        '">' +
        label +
        "</td>";
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    resultsEl.appendChild(table);

    statusEl.textContent =
      "Verification complete. " +
      valid +
      " valid, " +
      invalid +
      " invalid, " +
      unsigned +
      " unsigned of " +
      lines.length +
      " entries.";
  } catch (err) {
    statusEl.textContent = "Verification failed: " + err.message;
    statusEl.className = "invalid";
  }
})();
