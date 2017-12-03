/* eslint-env node */
module.exports = {
  "framework": "qunit",
  "test_page": "tests/index.html?hidepassed",
  "disable_watching": true,
  "launch_in_ci": [
    "Chrome"
  ],
  "launch_in_dev": [
    "Chrome"
  ],
  "browser_start_timeout": 60,
  "browser_args": {
    "Chrome": [
      "--disable-gpu",
      "--disable-web-security", // optional, since chrome 60+
      "--headless",
      "--incognito", // optional
      "--no-sandbox", // optional, since chrome 60+
      "--remote-debugging-address=0.0.0.0",
      "--remote-debugging-port=9222"
    ]
  }
};
