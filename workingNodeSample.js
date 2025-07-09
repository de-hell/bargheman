const TARGET_ADDRESS = "160";
const API_URL = "https://uiapi2.saapa.ir/api/ebills/PlannedBlackoutsReport";
const BILL_ID = "7241520414129";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IntcIlVzZXJJcFwiOm51bGwsXCJVc2VySWRcIjoxNzI0OTM4NCxcIlNlc3Npb25LZXlcIjpudWxsfSIsImV4cCI6MTc2NzA3OTgwMCwiaWF0IjoxNzUxMjY4NjAwLCJuYmYiOjE3NTEyNjg2MDB9.fxZLpwZmqC3zLmtfREtBMFCsFK75L6u10bdeaQcbN0c";

// fetch data from bargheman
async function fetchBlackouts() {
  const requestBody = {
    bill_id: BILL_ID,
    from_date: "",
    to_date: "",
  };

  try {
    const response = await fetch(API_URL, {
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
      const errorText = await response.text();
      console.log(errorText);
      return [];
    }

    const result = await response.json();
    console.log("msg: ", result.message);

    if (!Array.isArray(result.data)) {
      console.error("Unexpected response format:", result);
      return [];
    }

    const filtered = result.data
      .filter((entry) => {
        const matchAddress = entry.outage_address.includes(TARGET_ADDRESS);
        return matchAddress;
      })
      .map((entry) => ({
        date: entry.outage_date,
        startTime: entry.outage_start_time,
        endTime: entry.outage_stop_time,
        desc: entry.reason_outage.slice(0, 10),
      }));

    console.log(`✅ Found ${filtered.length} matching blackout(s):`);
    console.log(JSON.stringify(filtered, null, 2));

    return filtered;
  } catch (err) {
    console.error("❌ Error:", err);
    return [];
  }
}

fetchBlackouts();
