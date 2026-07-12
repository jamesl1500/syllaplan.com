import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
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
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#f7f3ec",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: "#d97757",
            }}
          />
          <div style={{ display: "flex", fontSize: 40, fontWeight: 600, color: "#1c1917" }}>
            {siteConfig.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.15,
            color: "#1c1917",
            maxWidth: 920,
          }}
        >
          {siteConfig.tagline}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            color: "#57534e",
            maxWidth: 860,
          }}
        >
          Built for students, powered by Claude.
        </div>
      </div>
    ),
    { ...size },
  );
}
