const USER = "database_cache_username";
const KEY = Buffer.from("database_cache_password");
const { Client } = require("net-ipc");
const { EventEmitter } = require('events')

class RemoteCacheClient extends EventEmitter {
    constructor(options) {
        super();

        if(!options.host || typeof options.host != "string") throw new SyntaxError("Missing the Option host");
        if(!options.port || typeof options.port != "number") throw new SyntaxError("Missing the Option port");
        if(!options.username || typeof options.username != "string") throw new SyntaxError("Missing the Option username");
        if(!options.password || typeof options.password != "string") throw new SyntaxError("Missing the Option password");
        if(options.tls && typeof options.tls != "boolean") throw new SyntaxError("Provided option tls is not a Boolean");

        this.host = options.host || "localhost";
        this.port = options.port || 5000;
        this.tls = options.tls || true; 
        this.username = options.username || "database_cache";
        this.password = Buffer.from(options.password) || Buffer.from("database_password");

        this.client = new Client({
            host: this.host,
            port: this.port,
            tls: this.tls,
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
    init() {
        this.client.connect().catch(console.error);
        this.client
            .on("ready", () => {
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
                this.emit('cacheRequest', request, response, client);
            });
    }
    async get(key) {
        if(!key) throw "Missing a key to get"

        return this.handleRequest("get", key);
    }
    async add(key, amount) {
        if(!key) throw "Missing a key to get"
        if(!amount || typeof amount != "number") throw "Missing the Amount (Number) to add to the Cache"

        return this.handleRequest("add", key, amount);
    }
    async push(key, element) {
        if(!key) throw "Missing a key to get"
        if(!element) throw "Missing the Element to push to the Cache"

        return this.handleRequest("push", key, element);
    }
    async has(key) {
        if(!key) throw "Missing a key to check for"

        return this.handleRequest("has", key);
    }
    async delete(key) {
        if(!key) throw "Missing a key to delete"

        return this.handleRequest("delete", key);
    }
    async set(key, data) {
        if(!key) throw "Missing a key to get"
        if(!data) throw "Missing a key to get"

        return this.handleRequest("set", key, data);
    }
    async size() {
        const response = await this.client.request({ 
            dbAction: "size", 
        }).catch(err => { throw err; });
        if(response?.error) {
            throw new Error(response.error);
        }
        return { data: response.data };
    }
    async ping() {
        return await this.client.ping();
    }
    async values() {
        return this.handleRequest("values");
    }
    async all() {
        return this.values();
    }
    async keys() {
        return this.handleRequest("keys");
    }
    async entries() {
        return this.handleRequest("entries");
    }

    async handleRequest(type, key, data) {
        const response = await this.client.request({ 
            dbAction: type, 
            key, 
            data
        }).catch(err => { throw err; });
        if(response?.error) {
            throw new Error(response.error);
        }
        return { data: response.data };
    }
}  
module.exports = RemoteCacheClient;