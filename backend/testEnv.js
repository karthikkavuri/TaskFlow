require("dotenv").config();

console.log("\n=== Environment Variables Check ===\n");
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ SET" : "❌ NOT SET");
console.log("SENDGRID_FROM_EMAIL:", process.env.SENDGRID_FROM_EMAIL || "❌ NOT SET");
console.log("SENDGRID_FROM_NAME:", process.env.SENDGRID_FROM_NAME || "❌ NOT SET");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "❌ NOT SET");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ SET" : "❌ NOT SET");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ NOT SET");
console.log("PORT:", process.env.PORT || "❌ NOT SET");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");

console.log("\n=== Validation ===\n");

let errors = [];

if (!process.env.SENDGRID_API_KEY) {
  errors.push("❌ SENDGRID_API_KEY is missing!");
}
if (!process.env.SENDGRID_FROM_EMAIL) {
  errors.push("❌ SENDGRID_FROM_EMAIL is missing!");
}
if (!process.env.MONGO_URI) {
  errors.push("❌ MONGO_URI is missing!");
}

if (errors.length > 0) {
  console.log("Issues found:");
  errors.forEach(err => console.log(err));
  console.log("\n📝 Update your .env file with the missing values\n");
} else {
  console.log("✅ All critical environment variables are set!\n");
}
