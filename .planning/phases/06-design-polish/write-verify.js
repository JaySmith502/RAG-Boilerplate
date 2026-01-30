const fs=require("fs");const c=fs.readFileSync("06-VERIFICATION.md","utf8");console.log("Current file lines:",c.split("
").length);