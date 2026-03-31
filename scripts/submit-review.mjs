import { readFileSync } from "fs";
import jwt from "jsonwebtoken";
import https from "https";

const KEY_ID = "2UHVJ3N5LJ";
const ISSUER_ID = "e30fca41-01fd-4020-9b38-9bbde2b0ed44";
const APP_ID = "6761318249";

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
  const url = `https://api.appstoreconnect.apple.com${path}`;
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Check version state
const versions = await apiFetch("GET", `/v1/apps/${APP_ID}/appStoreVersions?limit=3`);
for (const v of versions.data || []) {
  console.log(`Version ${v.attributes.versionString}: ${v.attributes.appStoreState} (${v.id})`);
}

const version = versions.data?.[0];
if (!version) { console.log("No version found"); process.exit(1); }

console.log(`\nCurrent state: ${version.attributes.appStoreState}`);

// Check if there's an existing review submission
const existingSubs = await apiFetch("GET", `/v1/reviewSubmissions?filter[app]=${APP_ID}&filter[state]=WAITING_FOR_REVIEW,UNRESOLVED,IN_REVIEW`);
console.log("Existing submissions:", JSON.stringify(existingSubs.data?.map(s => ({ id: s.id, state: s.attributes?.state })) || []));

if (existingSubs.data?.length > 0) {
  console.log("\nAlready submitted for review! Nothing to do.");
  process.exit(0);
}

// Create a review submission
console.log("\nCreating review submission...");
const submission = await apiFetch("POST", "/v1/reviewSubmissions", {
  data: {
    type: "reviewSubmissions",
    relationships: {
      app: { data: { type: "apps", id: APP_ID } },
    },
  },
});

if (submission.data) {
  console.log(`Created submission: ${submission.data.id} (state: ${submission.data.attributes?.state})`);

  // Add the version as a submission item
  const submissionId = submission.data.id;

  // If state is READY_FOR_REVIEW, we can confirm it
  if (submission.data.attributes?.state === "READY_FOR_REVIEW") {
    console.log("Confirming submission...");
    const confirm = await apiFetch("PATCH", `/v1/reviewSubmissions/${submissionId}`, {
      data: {
        type: "reviewSubmissions",
        id: submissionId,
        attributes: { submitted: true },
      },
    });
    if (confirm.data) {
      console.log(`Submitted! State: ${confirm.data.attributes?.state}`);
    } else {
      console.log("Confirm result:", JSON.stringify(confirm));
    }
  } else {
    // Add the version item first
    console.log("Adding version to submission...");
    const addItem = await apiFetch("POST", "/v1/reviewSubmissionItems", {
      data: {
        type: "reviewSubmissionItems",
        relationships: {
          reviewSubmission: { data: { type: "reviewSubmissions", id: submissionId } },
          appStoreVersion: { data: { type: "appStoreVersions", id: version.id } },
        },
      },
    });
    console.log("Add item result:", JSON.stringify(addItem.data ? { id: addItem.data.id } : addItem.errors || addItem));

    // Now confirm
    console.log("Confirming submission...");
    const confirm = await apiFetch("PATCH", `/v1/reviewSubmissions/${submissionId}`, {
      data: {
        type: "reviewSubmissions",
        id: submissionId,
        attributes: { submitted: true },
      },
    });
    if (confirm.data) {
      console.log(`Submitted! State: ${confirm.data.attributes?.state}`);
    } else {
      console.log("Confirm result:", JSON.stringify(confirm));
    }
  }
} else {
  console.log("Submission error:", JSON.stringify(submission.errors || submission));
}

console.log("\nDone!");
