import { readFileSync } from "fs";
import { basename } from "path";
import jwt from "jsonwebtoken";
import https from "https";

const KEY_ID = "2UHVJ3N5LJ";
const ISSUER_ID = "e30fca41-01fd-4020-9b38-9bbde2b0ed44";
const BUNDLE_ID = "com.ardsleypost.app";

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
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(data ? JSON.parse(data) : {}); }
        catch { resolve(data); }
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
  };
  for (const h of headers) options.headers[h.name] = h.value;
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

async function uploadScreenshot(setId, filePath) {
  const fileName = basename(filePath);
  const fileData = readFileSync(filePath);
  const fileSize = fileData.length;
  console.log(`  Uploading ${fileName} (${fileSize} bytes) to set ${setId}...`);

  const reserve = await apiFetch("POST", "/v1/appScreenshots", {
    data: {
      type: "appScreenshots",
      attributes: { fileName, fileSize },
      relationships: {
        appScreenshotSet: { data: { type: "appScreenshotSets", id: setId } },
      },
    },
  });

  if (!reserve.data) {
    console.error("    Reserve failed:", JSON.stringify(reserve.errors || reserve));
    return false;
  }

  const screenshotId = reserve.data.id;
  const operations = reserve.data.attributes.uploadOperations;

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const chunk = fileData.slice(op.offset, op.offset + op.length);
    await uploadBinary(op.url, op.requestHeaders, chunk);
  }

  const checksum = reserve.data.attributes.sourceFileChecksum;
  const commit = await apiFetch("PATCH", `/v1/appScreenshots/${screenshotId}`, {
    data: {
      type: "appScreenshots",
      id: screenshotId,
      attributes: { uploaded: true, sourceFileChecksum: checksum },
    },
  });

  if (commit.data) {
    console.log(`    Uploaded! State: ${commit.data.attributes.assetDeliveryState?.state}`);
    return true;
  } else {
    console.error("    Commit failed:", JSON.stringify(commit.errors));
    return false;
  }
}

async function run() {
  // Step 1: Find the app
  console.log("Finding app...");
  const apps = await apiFetch("GET", `/v1/apps?filter[bundleId]=${BUNDLE_ID}`);
  if (!apps.data?.length) {
    console.error("App not found!");
    return;
  }
  const appId = apps.data[0].id;
  console.log(`  App ID: ${appId} (${apps.data[0].attributes.name})`);

  // Step 2: Get the editable app store version
  console.log("\nFinding editable app store version...");
  const versions = await apiFetch("GET", `/v1/apps/${appId}/appStoreVersions?filter[appStoreState]=PREPARE_FOR_SUBMISSION,DEVELOPER_REJECTED,REJECTED,METADATA_REJECTED,WAITING_FOR_REVIEW,IN_REVIEW,READY_FOR_DISTRIBUTION`);

  let version = null;
  if (versions.data?.length) {
    version = versions.data[0];
  } else {
    // Try getting all versions
    const allVersions = await apiFetch("GET", `/v1/apps/${appId}/appStoreVersions?limit=5`);
    if (allVersions.data?.length) {
      version = allVersions.data[0];
    }
  }

  if (!version) {
    console.error("No editable version found!");
    return;
  }
  console.log(`  Version: ${version.attributes.versionString} (state: ${version.attributes.appStoreState})`);
  const versionId = version.id;

  // Step 3: Get localizations
  console.log("\nGetting localizations...");
  const localizations = await apiFetch("GET", `/v1/appStoreVersions/${versionId}/appStoreVersionLocalizations`);
  if (!localizations.data?.length) {
    console.error("No localizations found!");
    return;
  }
  const locId = localizations.data[0].id;
  console.log(`  Localization: ${localizations.data[0].attributes.locale} (${locId})`);

  // Step 4: Get screenshot sets
  console.log("\nGetting screenshot sets...");
  const sets = await apiFetch("GET", `/v1/appStoreVersionLocalizations/${locId}/appScreenshotSets`);

  // Find iPad screenshot sets
  const ipadDisplayTypes = [
    "APP_IPAD_PRO_3GEN_129",    // iPad Pro 12.9" 3rd gen (2048x2732)
    "APP_IPAD_PRO_129",          // iPad Pro 12.9" 2nd gen (2048x2732)
    "APP_IPAD_105",              // iPad 10.5" (1668x2224)
    "APP_IPAD_97",               // iPad 9.7" (1536x2048)
  ];

  const ipadSets = {};
  for (const set of (sets.data || [])) {
    const dt = set.attributes.screenshotDisplayType;
    if (ipadDisplayTypes.includes(dt)) {
      ipadSets[dt] = set.id;
      console.log(`  Found iPad set: ${dt} (${set.id})`);
    }
  }

  // Step 5: Delete old iPad screenshots and upload new ones
  const screenshotFiles = [
    "screenshots/ipad-01-feed.png",
    "screenshots/ipad-02-profile.png",
    "screenshots/ipad-03-messages.png",
    "screenshots/ipad-04-post.png",
  ];

  for (const [displayType, setId] of Object.entries(ipadSets)) {
    console.log(`\nProcessing ${displayType}...`);

    // Get existing screenshots in this set
    const existing = await apiFetch("GET", `/v1/appScreenshotSets/${setId}/appScreenshots`);
    if (existing.data?.length) {
      console.log(`  Deleting ${existing.data.length} old screenshot(s)...`);
      for (const ss of existing.data) {
        await apiFetch("DELETE", `/v1/appScreenshots/${ss.id}`);
      }
    }

    // Upload new screenshots
    for (const file of screenshotFiles) {
      await uploadScreenshot(setId, file);
    }
  }

  // If no iPad sets exist yet, create them
  if (Object.keys(ipadSets).length === 0) {
    console.log("\nNo iPad screenshot sets found. Creating them...");
    for (const dt of ["APP_IPAD_PRO_3GEN_129", "APP_IPAD_PRO_129"]) {
      console.log(`  Creating set for ${dt}...`);
      const newSet = await apiFetch("POST", "/v1/appScreenshotSets", {
        data: {
          type: "appScreenshotSets",
          attributes: { screenshotDisplayType: dt },
          relationships: {
            appStoreVersionLocalization: {
              data: { type: "appStoreVersionLocalizations", id: locId },
            },
          },
        },
      });
      if (newSet.data) {
        console.log(`    Created: ${newSet.data.id}`);
        for (const file of screenshotFiles) {
          await uploadScreenshot(newSet.data.id, file);
        }
      } else {
        console.error(`    Failed:`, JSON.stringify(newSet.errors || newSet));
      }
    }
  }

  // Step 6: Select the latest build
  console.log("\nChecking for builds...");
  const builds = await apiFetch("GET", `/v1/builds?filter[app]=${appId}&sort=-uploadedDate&limit=1`);
  if (builds.data?.length) {
    const build = builds.data[0];
    console.log(`  Latest build: ${build.attributes.version} (state: ${build.attributes.processingState})`);

    if (build.attributes.processingState === "VALID") {
      console.log("  Setting build on version...");
      const setBuild = await apiFetch("PATCH", `/v1/appStoreVersions/${versionId}`, {
        data: {
          type: "appStoreVersions",
          id: versionId,
          relationships: {
            build: { data: { type: "builds", id: build.id } },
          },
        },
      });
      if (setBuild.data) {
        console.log("  Build set successfully!");
      } else {
        console.log("  Build set result:", JSON.stringify(setBuild.errors || setBuild));
      }
    } else {
      console.log(`  Build is still processing (${build.attributes.processingState}). You'll need to set it manually or wait and re-run.`);
    }
  }

  // Step 7: Submit for review
  console.log("\nSubmitting for review...");
  const submission = await apiFetch("POST", "/v1/appStoreVersionSubmissions", {
    data: {
      type: "appStoreVersionSubmissions",
      relationships: {
        appStoreVersion: { data: { type: "appStoreVersions", id: versionId } },
      },
    },
  });

  if (submission.data) {
    console.log("Successfully submitted for App Store review!");
  } else {
    // Try v2 submissions API
    const sub2 = await apiFetch("POST", "/v2/submissions", {
      data: {
        type: "submissions",
        relationships: {
          items: {
            data: [{ type: "appStoreVersions", id: versionId }],
          },
        },
      },
    });
    if (sub2.data) {
      console.log("Successfully submitted for App Store review!");
    } else {
      console.log("Submission response:", JSON.stringify(submission.errors || submission));
      console.log("V2 submission response:", JSON.stringify(sub2.errors || sub2));
    }
  }

  console.log("\nDone!");
}

run().catch(console.error);
