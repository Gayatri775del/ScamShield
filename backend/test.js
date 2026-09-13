const http = require("http");

const data = JSON.stringify({
    url: "https://fake-example.com",
    text: "URGENT! Your bank account will be suspended. Enter your OTP and password. Enter your credit card and CVV. Pay now to claim your reward."
});

const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/scan",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {

    console.log("STATUS:", res.statusCode);

    let response = "";

    res.on("data", (chunk) => {
        response += chunk;
    });

    res.on("end", () => {
        console.log("RESPONSE:");
        console.log(response);
    });

});

req.on("error", (error) => {
    console.error("REQUEST ERROR:", error);
});

req.write(data);
req.end();