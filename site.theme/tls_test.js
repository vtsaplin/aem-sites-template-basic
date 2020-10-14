var https = require("https");
var req = https.request({
  host: "api.stripe.com",
  port: "443",
  path: "/v1/charges",
  method: "GET",
  headers: {
    "Authorization": "Bearer sk_test_BQokikJOvBiI2HlWgH4olfQ2",
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  }
}, function (res) {
  res.on("data", function (data) {
    console.log("TLS 1.2 supported, no action required.");
  });
});
req.end();
req.on("error", function(err) {
  if (err.code == "ECONNRESET") {
    console.log("TLS 1.2 not supported! You will need to upgrade");
  } else {
    console.log("Unknown error talking to Stripe, please try again later.");
  }
});
