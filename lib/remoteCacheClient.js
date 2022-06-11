
const { Client } = require("net-ipc");
const { EventEmitter } = require('events')

class RemoteCacheClient extends EventEmitter {
    constructor(options) {
        super();
        
        if(options.host === undefined || options.host !== undefined && typeof options.host != "string") throw new SyntaxError("Missing the Option host");
        if(options.port === undefined || options.port !== undefined && typeof options.port != "number") throw new SyntaxError("Missing the Option port");
        if(options.username === undefined || options.username !== undefined && typeof options.username != "string") throw new SyntaxError("Missing the Option username");
        if(options.password === undefined || options.password !== undefined && typeof options.password != "string") throw new SyntaxError("Missing the Option password");
        if(options.tls !== undefined && typeof options.tls != "boolean") throw new SyntaxError("Provided option tls is not a Boolean");
        if(options.compress !== undefined && typeof options.compress != "boolean") throw new SyntaxError("Provided option tls is not a Boolean");
        // 0 ..
        // > 0 .. | Update cache every X milliseconds
        // <= 0 .. instantly update the cache on the server
        this.host = options.host || "localhost";
        this.port = options.port || 5000;
        
        this.tls = options.tls !== undefined ? options.tls : false; 
        this.compress = options.compress !== undefined ? options.compress : false; 

        this.username = options.username || "database_cache";
        this.password = Buffer.from(options.password) || Buffer.from("database_password");
        this.keyNotInCacheResponse = options.keyNotInCacheResponse || null;
        this.requestAChange = false;
        this.mapCache = new Map();

        this.client = new Client({
            host: this.host,
            port: this.port,
            tls: this.tls,
            compress: this.compress,
            options: {
                pskCallback: () => {
                    // return the user and the key for verification
                    return {
                        identity: this.username,
                        psk: Buffer.from(this.password)
                    }
                },
                ciphers: "PSK", // enable PSK ciphers, they are disabled by default
                checkServerIdentity: () => void 0, // bypass SSL certificate verification since we are not using certificates
            }
        });
        return this.init(), this;
    }
    updateCache() {
        
    }
    init() {
        this.client.connect().catch(console.error);
        this.client
            .on("ready", async () => {
                this.mapCache = new Map(await this.entries());
                this.emit('cacheReady', null);
            })
            .on("error", (error) => {
                this.emit('cacheError', error);
            })
            .on("close", (reason) => {
                this.emit('cacheClose', reason);
            })
            .on("message", (message) => {
                this.emit('cacheMessage', message);
            })
            .on("request", async (request, response, client) => {
                if(request.requestAChange && request.wholeCache) {
                    this.emit('cacheUpdateRequest', { requestAChange: request.requestAChange, wholeCache: request.wholeCache });
                    this.mapCache = new Map(request.wholeCache);
                    this.requestAChange = false;
                    await response({ success: true }).catch(console.warn);
                } else if(request.requestAChange) {
                    this.mapCache = new Map();
                    this.requestAChange = false;
                    await response({ success: true }).catch(console.warn);
                    this.emit('cacheUpdateRequest', { requestAChange: request.requestAChange, wholeCache: request.wholeCache });
                } else {
                    this.emit('cacheRequest', request, response, client);
                }
            });
    }
    async get(key) {
        if(!key) return console.error("Missing a key to get")
        if(!this.requestAChange) return this.mapCache.get(key);
        
        return this.handleRequest("get", key);
    }
    async add(key, amount) {
        if(!key) throw "Missing a key to add"
        if(!amount || typeof amount != "number") throw "Missing the Amount (Number) to add to the Cache"
        
        this.requestAChange = true;
        return this.handleRequest("add", key, amount);
    }
    async push(key, element) {
        if(!key) throw "Missing a key to push"
        if(!element) throw "Missing the Element to push to the Cache"
        
        this.requestAChange = true;
        return this.handleRequest("push", key, element);
    }
    async has(key) {
        if(!key) throw "Missing a key to check for"
        if(!this.requestAChange) return this.mapCache.has(key);
        
        return this.handleRequest("has", key);
    }
    async delete(key) {
        if(!key) throw "Missing a key to delete"
       
        this.requestAChange = true;
        return this.handleRequest("delete", key);
    }
    async clear() {
        
        this.requestAChange = true;
        return this.handleRequest("clear");
    }
    async set(key, data) {
        if(!key) throw "Missing a key to set"
        if(!data) throw "Missing a key to set"
        this.requestAChange = true;
        return this.handleRequest("set", key, data);
    }
    async size() {
        if(!this.requestAChange) return this.mapCache.size;
        
        return this.handleRequest("size");
    }
    async ping() {
        return await this.client.ping();
    }
    async values() {
        if(!this.requestAChange) return [...this.mapCache.values()];
        return this.handleRequest("values");
    }
    async all() {
        if(!this.requestAChange) return [...this.mapCache.entries()];
        return this.values();
    }
    async keys() {
        if(!this.requestAChange) return [...this.mapCache.keys()];
        return this.handleRequest("keys");
    }
    async entries() {
        if(!this.requestAChange) return [...this.mapCache.entries()];
        return this.handleRequest("entries");
    }

    async handleRequest(type, key, data) {
        const response = await this.client.request({ 
            dbAction: type, 
            key, 
            data
        }).catch(err => { console.log("REQUEST", err) });
        if(!response) return false;
        if(response?.error) {
            if(response?.error == "Key_is_not_in_Cache") {
                return this.keyNotInCacheResponse;
            }
            throw new new Error(response.error);
        }
        this.requestAChange = false;
        return response.data;
    }
}  
module.exports = RemoteCacheClient;
