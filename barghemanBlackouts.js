const TARGET_ADDRESS = "160";
const API_URL = "https://uiapi2.saapa.ir/api/ebills/PlannedBlackoutsReport";
const BILL_ID = "7241520414129";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IntcIlVzZXJJcFwiOm51bGwsXCJVc2VySWRcIjoxNzI0OTM4NCxcIlNlc3Npb25LZXlcIjpudWxsfSIsImV4cCI6MTc2NzA3OTgwMCwiaWF0IjoxNzUxMjY4NjAwLCJuYmYiOjE3NTEyNjg2MDB9.fxZLpwZmqC3zLmtfREtBMFCsFK75L6u10bdeaQcbN0c";

// fetch data from bargheman
export const handler = async (event) => {
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
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "API Error", details: errorText }),
      };
    }

    const result = await response.json();

    if (!Array.isArray(result.data)) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid API Response", result }),
      };
    }

    // Filter and map to simplified structure
    const filteredData = result.data
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

    return {
      statusCode: 200,
      body: JSON.stringify(filteredData),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unexpected Error",
        details: error.message,
      }),
    };
  }
};
