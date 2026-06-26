import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "rgb(250, 250, 250)",
          color: "rgb(30, 34, 38)",
          padding: 72,
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              background: "rgb(64, 119, 151)",
            }}
          />
          Ledgerful
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 82, lineHeight: 0.98, fontWeight: 800, maxWidth: 940 }}>
            Local-first change intelligence and signed provenance.
          </div>
          <div style={{ fontSize: 30, color: "rgb(78, 88, 96)", maxWidth: 850 }}>
            Repo risk, verification evidence, local SOC2 export, and launch-safe feature states.
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 24 }}>
          <span>Available local engine</span>
          <span>Beta MCP + Action</span>
          <span>Hosted planned</span>
        </div>
      </div>
    ),
    size,
  );
}
