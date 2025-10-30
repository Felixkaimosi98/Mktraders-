// Deriv API connection for live balance
const app_id = import.meta.env.VITE_DERIV_APP_ID || process.env.DERIV_APP_ID || "107421";
const token = import.meta.env.VITE_DERIV_API_TOKEN || process.env.DERIV_API_TOKEN;

if (!token) {
  console.error("❌ Deriv API token missing. Add it in Render Environment Variables.");
}

const connection = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${app_id}`);

connection.onopen = () => {
  console.log("✅ Connected to Deriv API");
  connection.send(JSON.stringify({ authorize: token }));
};

connection.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.error) {
    console.error("❌ Deriv API Error:", data.error.message);
    document.getElementById("balance").innerText = "Error loading balance";
    return;
  }

  if (data.msg_type === "authorize") {
    console.log("✅ Authorized successfully");
    connection.send(JSON.stringify({ balance: 1, subscribe: 1 }));
  }

  if (data.msg_type === "balance") {
    const balance_value = data.balance.balance;
    document.getElementById("balance").innerText = `${balance_value} USD`;
  }
};
