import { readFileSync, writeFileSync } from "fs";
import { basename } from "path";
import jwt from "jsonwebtoken";
import https from "https";

const KEY_ID = "2UHVJ3N5LJ";
const ISSUER_ID = "e30fca41-01fd-4020-9b38-9bbde2b0ed44";
const SET_ID = process.argv[2] || "eadc9bdd-9ef6-47a1-8194-fcaa8a36743c";

function getToken() {
  const key = readFileSync("C:\\Users\\Daniel\\Downloads\\AuthKey_2UHVJ3N5LJ.p8");
  return jwt.sign({}, key, {
    algorithm: "ES256",
    expiresIn: "20m",
    issuer: ISSUER_ID,
    header: { alg: "ES256", kid: KEY_ID, typ: "JWT" },
    audience: "appstoreconnect-v1",
  });
}

async function apiFetch(method, path, body = null) {
  const token = getToken();
  const url = path.startsWith("http") ? path : `https://api.appstoreconnect.apple.com${path}`;
  const parsed = new URL(url);

  const options = {
    hostname: parsed.hostname,
    path: parsed.pathname + parsed.search,
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    rejectUnauthorized: false,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch {
          resolve(data);
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

async function uploadBinary(url, headers, fileData) {
  const parsed = new URL(url);
  const options = {
    hostname: parsed.hostname,
    path: parsed.pathname + parsed.search,
    method: "PUT",
    headers: {},
    rejectUnauthorized: false,
  };

  for (const h of headers) {
    options.headers[h.name] = h.value;
  }
  options.headers["Content-Length"] = fileData.length;

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    req.write(fileData);
    req.end();
  });
}

async function uploadScreenshot(filePath) {
  const fileName = basename(filePath);
  const fileData = readFileSync(filePath);
  const fileSize = fileData.length;

  console.log(`\nUploading ${fileName} (${fileSize} bytes)...`);

  // Step 1: Reserve
  const reserve = await apiFetch("POST", "/v1/appScreenshots", {
    data: {
      type: "appScreenshots",
      attributes: { fileName, fileSize },
      relationships: {
        appScreenshotSet: {
          data: { type: "appScreenshotSets", id: SET_ID },
        },
      },
    },
  });

  if (!reserve.data) {
    console.error("Reserve failed:", JSON.stringify(reserve.errors));
    return;
  }

  const screenshotId = reserve.data.id;
  const operations = reserve.data.attributes.uploadOperations;
  console.log(`  Reserved: ${screenshotId}, ${operations.length} upload operation(s)`);

  // Step 2: Upload each part
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const chunk = fileData.slice(op.offset, op.offset + op.length);
    console.log(`  Uploading part ${i + 1}/${operations.length} (${chunk.length} bytes)...`);
    const result = await uploadBinary(op.url, op.requestHeaders, chunk);
    console.log(`  Part ${i + 1} status: ${result.status}`);
  }

  // Step 3: Commit
  const checksum = reserve.data.attributes.sourceFileChecksum;
  const commit = await apiFetch("PATCH", `/v1/appScreenshots/${screenshotId}`, {
    data: {
      type: "appScreenshots",
      id: screenshotId,
      attributes: {
        uploaded: true,
        sourceFileChecksum: checksum,
      },
    },
  });

  if (commit.data) {
    console.log(`  Committed! State: ${commit.data.attributes.assetDeliveryState?.state}`);
  } else {
    console.error("  Commit failed:", JSON.stringify(commit.errors));
  }
}

const files = process.argv.slice(3).length > 0
  ? process.argv.slice(3)
  : [
    "screenshots/01-feed.png",
    "screenshots/02-login.png",
    "screenshots/03-post.png",
  ];

for (const f of files) {
  await uploadScreenshot(f);
}

console.log("\nDone!");
