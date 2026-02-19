const config = { 
    "ip": "127.0.0.1",
    "port": 8080,
    "onStart": (server) => console.log('hi!') 
};
const distribution = require("./distribution.js")(config);
distribution.node.start(console.log);

