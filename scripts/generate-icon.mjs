// Use dynamic import — works with pnpm's strict module resolution
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  // pnpm may not hoist sharp; try the .pnpm store directly
  const { readdirSync } = await import("fs");
  const { join } = await import("path");
  const pnpmDir = join(process.cwd(), "node_modules", ".pnpm");
  const sharpDir = readdirSync(pnpmDir).find((d) => d.startsWith("sharp@"));
  if (sharpDir) {
    sharp = (await import(join(pnpmDir, sharpDir, "node_modules", "sharp", "lib", "index.js"))).default;
  } else {
    throw new Error("sharp not found — run: pnpm add -D sharp");
  }
}

// Finalized Ardsleypost app icon — bold "A" lettermark with integrated speech bubble tail
// Professional, distinctive, and recognizable at all sizes

const svg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#111111"/>
    </linearGradient>
  </defs>

  <!-- Solid dark background with rounded iOS corners -->
  <rect width="1024" height="1024" rx="228" fill="url(#bg)"/>

  <!-- Bold geometric "A" lettermark -->
  <text x="512" y="460"
    font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
    font-weight="900"
    font-size="520"
    fill="#ffffff"
    text-anchor="middle"
    dominant-baseline="central"
    letter-spacing="-12">A</text>

  <!-- Speech bubble tail — marks this as a community/social app -->
  <path d="
    M 610 640
    L 680 760
    L 550 680
    Z
  " fill="#ffffff"/>

  <!-- Subtle horizontal line accent under the A crossbar -->
  <rect x="340" y="570" width="344" height="6" rx="3" fill="#ffffff" opacity="0.25"/>

  <!-- "post" text — small, clean branding -->
  <text x="512" y="820"
    font-family="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
    font-weight="600"
    font-size="100"
    fill="#ffffff"
    text-anchor="middle"
    dominant-baseline="central"
    letter-spacing="16"
    opacity="0.5">POST</text>
</svg>`;

async function generate() {
  // Generate opaque 1024x1024 base (Apple requires no alpha)
  const base = await sharp(Buffer.from(svg))
    .flatten({ background: { r: 26, g: 26, b: 26 } })
    .png()
    .toBuffer();

  // Save at different sizes
  await sharp(base).resize(1024, 1024).toFile("public/icons/icon-1024.png");
  await sharp(base).resize(512, 512).toFile("public/icons/icon-512.png");
  await sharp(base).resize(192, 192).toFile("public/icons/icon-192.png");
  await sharp(base).resize(32, 32).toFile("public/favicon.ico");

  // Also generate the iOS app icon for Xcode asset catalog
  await sharp(base)
    .resize(1024, 1024)
    .toFile("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png");

  console.log(
    "✓ Generated icons: icon-1024.png, icon-512.png, icon-192.png, favicon.ico, iOS AppIcon"
  );
}

generate().catch(console.error);
