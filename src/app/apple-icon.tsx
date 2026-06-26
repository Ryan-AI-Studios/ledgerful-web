import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgb(64, 119, 151)",
          color: "rgb(250, 250, 250)",
          fontSize: 82,
          fontWeight: 800,
          fontFamily: "Arial",
        }}
      >
        L
      </div>
    ),
    size,
  );
}
