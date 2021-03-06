<div align="center">
  <p> 
    <a href="https://discord.gg/milrato" title="Join our Discord Server"><img alt="Built with Love" src="https://forthebadge.com/images/badges/built-with-love.svg"></a>
    <a href="https://discord.gg/milrato" title="Join our Discord Server"><img alt="Made with Javascript" src="https://forthebadge.com/images/badges/made-with-javascript.svg"></a>
  </p>
  <p>
    <a href="https://discord.gg/milrato"><img src="https://discord.com/api/guilds/773668217163218944/embed.png" alt="Discord server"/></a>
    <a href="https://www.npmjs.com/package/remote-map-cache"><img src="https://img.shields.io/npm/v/remote-map-cache.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/remote-map-cache"><img src="https://img.shields.io/npm/dt/remote-map-cache.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://discord.gg/milrato"><img src="https://maintained.cc/SDBagel/Maintained/2?" alt="Get Started Now"></a>
    <a href="https://www.paypal.com/MilratoDevelopment"><img src="https://img.shields.io/badge/donate-patreon-F96854.svg" alt="Patreon" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/remote-map-cache/"><img src="https://nodei.co/npm/remote-map-cache.png?downloads=true&stars=true" alt="npm installnfo" /></a>
  </p>
</div>

# remote-map-cache
A remote nodejs Cache Server, for you to have your perfect MAP Cache Saved and useable remotely. Easy Server and Client Creations, fast, stores the Cache before stopping and restores it again!

# Installation
```
npm install https://github.com/Tomato6966/remote-map-cache
npm install remote-map-cache
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

# Methods (Functions) for the CACHE-CLIENT(s)

- get(key)
- set(key)
- add(key, amount)
- push(key, element)
- has(key)
- delete(key)
- clear() *clears the whole cache Map*
- all() / values() *array of all values*
- entries() *array of [key, value]*
- keys() *array of all keys*
- ping() *shows the ping*
- size() *shows the cache-map-size*

# Events for the CACHE-SERVER

- serverReady *shows when the server is ready, you don't need to listen to it!*
- serverError *shows when the server errors, you don't need to listen to it!*
- serverClose *shows when the server closes, you don't need to listen to it!*
- serverConnect *shows when a client connects, you don't need to listen to it!*
- serverDisconnect *shows when a client disconnects, you don't need to listen to it!*
- serverMessage *receives messages from a cache-client, you don't need to listen to it!*
- serverRequest *received requets from a cache-client, used for sending the cache datas, you don't need to listen to it!*
- 
# Events for the CACHE-Client(s)

- cacheReady *shows when the server is ready, you don't need to listen to it!*
- cacheError *shows when the server errors, you don't need to listen to it!*
- cacheClose *shows when the server closes, you don't need to listen to it!*
- cacheMessage *receives messages from the cache-server, you don't need to listen to it!*
- cacheRequest *receives requets from the cache-server, you don't need to listen to it!*
