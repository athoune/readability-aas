const process = require('process');
const express = require("express");
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const bodyParser = require("body-parser");
const { JSONRPCServer } = require("json-rpc-2.0");

const server = new JSONRPCServer();

// First parameter is a method name.
// Second parameter is a method itself.
// A method takes JSON-RPC params and returns a result.
// It can also return a promise of the result.
server.addMethod("echo", ({ text }) => text);
server.addMethod("log", ({ message }) => console.log(message));
server.addMethod("readability", ({ body }) => {
    let doc = new JSDOM(body, { });
    let reader = new Readability(doc.window.document);
    let r = reader.parse();
    console.log('readability:', r.title);
    return r;
} );

const app = express();
app.use(bodyParser.json());

app.post("/json-rpc", (req, res) => {
  const jsonRPCRequest = req.body;
  // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
  // It can also receive an array of requests, in which case it may return an array of responses.
  // Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
  server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
    if (jsonRPCResponse) {
      res.json(jsonRPCResponse);
    } else {
      // If response is absent, it was a JSON-RPC notification method.
      // Respond with no content status (204).
      res.sendStatus(204);
    }
  });
});

let port = parseInt(process.env.PORT || "8000", 10);
let host = process.env.HOST || "127.0.0.1"

console.log(`Listening http://${host}:${port}`);
app.listen(port, host);
