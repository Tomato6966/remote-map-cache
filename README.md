# remote-map-cache
A remote nodejs Cache Server, for you to have your perfect MAP Cache Saved and useable remotely. Easy Server and Client Creations, fast, stores the Cache before stopping and restores it again!

# Installation
```
npm install https://github.com/Tomato6966/remote-map-cache
npm install remote-map-cache # SOON
```

# Usage
1. Create the Cache (which can be used as a DB TOO!) - Create a File-Folder-Project, at your CACHE SERVER and put in this Code:

<details>
  <summary>Click to see the Code</summary>

```js
const { remoteCacheServer } = require("../../remote-map-cache/index");

const Server = new remoteCacheServer({
    username: "TheUserNameForTheCacheServer",
    password: "ThePasswordForTheCacheServer",
    port: 4040, // Any port
    tls: true
});
// Following Events are optional
Server
    .on("serverReady", () => {
        console.log("DatabaseCacheServer ready and waiting for connections");
    })
    .on("serverError", (error) => {
        console.error("DatabaseCacheServer error, ERROR:\n", error, "\n---\n");
    })
    .on("serverClose", (reason) => {
        console.log("DatabaseCacheServer closed");
    })
    .on("serverConnect", (connection, payload) => {
        console.log("DatabaseCacheServer a Client Connected");
    })
    .on("serverDisconnect", (connection, reason) => {
        console.log("DatabaseCacheServer a Client Disconnected");
    })
    .on("serverMessage", (message) => {
        // console.log("DatabaseCacheServer, received a Message", message);
    })
    .on("serverRequest", async (request, response, client) => {
        // console.log("DatabaseCacheRequest, received a Request", request);
    });
```
  
</details>

2. To connect the cache do this:

<details>
  <summary>Click to see the Code</summary>

```js
const { remoteCacheClient, remoteCacheServer } = require("../../remote-map-cache/index");
const client = new remoteCacheClient({
    username: "db_cache",
    password: "db_cache",
    host: "localhost",
    port: 5000,
    tls: true
})

// following events are optional
client
    .on("cacheReady", () => {
        console.log("DATABASECACHECLIENT ready and connected");
    })
    .on("cacheError", (error) => {
        console.error("DATABASECACHECLIENT error, ERROR:\n", error, "\n---\n");
    })
    .on("cacheClose", (reason) => {
        console.log("DATABASECACHECLIENT closed, REASON?:\n", reason, "\n---\n");
    })
    .on("cacheMessage", (message) => {
        console.log("message", message);
    })
    .on("cacheRequest", async (request, response, client) => {
        console.log("REQUEST", request);
    });

// example usage
async function yourProgram(){
    await client.set("hi", "bye").then(console.log).catch(console.error);
    await client.get("hi").then(console.log).catch(console.error);
    await client.set("array", []).then(console.log).catch(console.error);
    await client.push("array", "element").then(console.log).catch(console.error);
    await client.push("array", "element2").then(console.log).catch(console.error);
    await client.size().then(console.log).catch(console.error);
    await client.get("array").then(console.log).catch(console.error);
    await client.all().then(console.log).catch(console.error);
}

yourProgram();
```
</details>
