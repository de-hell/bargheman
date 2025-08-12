import dotenv from "dotenv";
dotenv.config();

// Validate required env vars
function validateEnvVars(...vars) {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`❌ Missing environment variable(s): ${missing.join(", ")}`);
    process.exit(1); // Stop execution
  }
}
validateEnvVars("BILL_ID", "AUTH_TOKEN", "TARGET_ADDRESS");

// Constants
const BARGHEMAN_API = "https://uiapi2.saapa.ir/api/ebills/PlannedBlackoutsReport";
const NETLIFY_API = "https://khamooshi.netlify.app/.netlify/functions/setBlackouts";
const BILL_ID = process.env.BILL_ID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const TARGET_ADDRESS = process.env.TARGET_ADDRESS;

// Fetch blackouts from bargheman
async function fetchBlackouts() {
  const requestBody = {
    bill_id: BILL_ID,
    from_date: "",
    to_date: "",
  };

  try {
    const response = await fetch(BARGHEMAN_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`❌ Failed: ${response.status} ${response.statusText}`);
      console.log(await response.text());
      return [];
    }

    const result = await response.json();
    console.log("msg:", result.message);

    if (!Array.isArray(result.data)) {
      console.error("Unexpected response format:", result);
      return [];
    }

    const filtered = result.data
      .filter(({ outage_address }) => outage_address.includes(TARGET_ADDRESS))
      .map((entry) => {
        const {
          outage_date,
          outage_start_time,
          outage_stop_time,
          reason_outage,
        } = entry;

        return {
          date: outage_date,
          startTime: outage_start_time,
          endTime: outage_stop_time,
          desc: reason_outage?.slice(0, 10) ?? "N/A",
        };
      });

    // const filtered = result.data
    // .filter((e) => e.outage_address.includes(TARGET_ADDRESS))
    // .map((e) => ({
    //   date: e.outage_date,
    //   startTime: e.outage_start_time,
    //   endTime: e.outage_stop_time,
    //   desc: e.reason_outage?.slice(0, 10),
    // }));

    console.log(`✅ Found ${filtered.length} matching blackout(s):`);
    console.log(JSON.stringify(filtered, null, 2));

    return filtered;
  } catch (err) {
    console.error("❌ Error fetching blackouts:", err);
    return [];
  }
}

// Send data to Netlify
async function sendToNetlify(outages) {
  try {
    const requestBody = {
      outages,
      lastUpdated: new Date().toISOString(),
    };

    const response = await fetch(NETLIFY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log("✅ Response from Netlify:", result);
  } catch (err) {
    console.error("❌ Error sending to Netlify:", err);
  }
}

// Main
async function main() {
  const outages = await fetchBlackouts();
  await sendToNetlify(outages);
}

// Top-level error handling for unhandled rejections
main().catch((err) => {
  console.error("❌ Uncaught error:", err);
  process.exit(1); // Exit with error code
});
