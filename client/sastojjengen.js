const crypto = require("crypto");

function generateSasToken(resourceUri, keyName, key, expiryYears = 10) {
  const encodedUri = encodeURIComponent(resourceUri);
  const expiry = Math.floor(new Date().getTime() / 1000) + expiryYears * 365 * 24 * 60 * 60; // 10 years
  const stringToSign = `${encodedUri}\n${expiry}`;
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(stringToSign);
  const signature = encodeURIComponent(hmac.digest("base64"));
  return `SharedAccessSignature sr=${encodedUri}&sig=${signature}&se=${expiry}&skn=${keyName}`;
}

// 🔐 Event Hub details
const eventHubNamespace = "edusync-quiz";
const eventHubName = "edusynchub";
const keyName = "RootManageSharedAccessKey";
const key = "VPTlf5QSI+u2k1Z2Qd+b3Q0+zBFJNOVhJ+AEhLnx/ek="; // 🔒 Primary key

const resourceUri = `https://${eventHubNamespace}.servicebus.windows.net/${eventHubName}`;
const token = generateSasToken(resourceUri, keyName, key, 10); // 10 years

console.log("✅ Generated SAS Token:\n");
console.log(token);
