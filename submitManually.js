// A quick manual submission tool to set blackouts

const NETLIFY_API = "https://khamooshi.netlify.app/.netlify/functions/setBlackouts";

const data = {
  outages: [
    {
      startTime: "13:00",
      endTime: "15:00",
      date: "1404/04/27",
      desc: "بابرنامه",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

const response = await fetch(NETLIFY_API, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

const result = await response.json();
console.log("✅ Response from Netlify:", result);
