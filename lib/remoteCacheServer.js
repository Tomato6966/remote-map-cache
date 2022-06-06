const Enmap = require("enmap");
const { Server } = require("net-ipc");
const { EventEmitter } = require('events')

class RemoteCacheServer extends EventEmitter {
    constructor(options) {
        super();

        if(!options.port || typeof options.port != "number") throw new SyntaxError("Missing the Option port");
        if(!options.username || typeof options.username != "string") throw new SyntaxError("Missing the Option username");
        if(!options.password || typeof options.password != "string") throw new SyntaxError("Missing the Option password");
        if(options.tls && typeof options.tls != "boolean") throw new SyntaxError("Provided option tls is not a Boolean");

        this.cache = new Map();

        this.port = options.port || 5000;
        this.tls = options.tls || true; 
        this.username = options.username || "database_cache";
        this.password = Buffer.from(options.password) || Buffer.from("database_password");

        this.server = new Server({
            port: this.port,
            tls: true,
            options: {
                pskCallback: (socket, identity) => {
                    if(identity === this.username) { // confirm username
                        return this.password; // return password for verification
                    }
                },
                ciphers: "PSK",
            }
        });

        // the perma storage, after closing the server to save the cache
        this.dbFile = new Enmap({
            name: "this.cache",
        });
        this.dbFile.ensure("cacheFile", { data: false });

        return this.init(), this;
    }
    init() {
        // start the server
        this.server.start().catch(console.error);
        this.server
            .on("ready", () => {
                this.emit('serverReady', null);
                const summaryArray = this.dbFile.get("cacheFile");
                if(summaryArray.data) {
                    this.cache = new Map(summaryArray.data);
                    console.log(`Loaded the Cache from the local file-DB (enmap storage) with a size of: ${this.cache.size}`);
                }
            })
            .on("close", () => {
                this.emit('serverClosed', null);
            })
            .on("connect", (connection, payload) => {
                this.emit('serverConnect', connection, payload);
            })
            .on("disconnect", (connection, reason) => {
                this.emit('serverDisconnect', connection, reason);
            })
            .on("error", (error) => {
                this.emit('serverError', error);
            })
            .on("message", (message, connection) => {
                this.emit('serverMessage', message, connection);
            })
            .on("request", async (request, response, client) => {
                this.emit('serverRequest', request, response, client);

                /* new Map()	
                    set(key, value)	--> set
                    get(key)    	--> get
                    clear()	        --> clear
                    delete(key)	    --> delete
                    has(key)	    --> has		
                    forEach()
                    entries()	    --> entries
                    keys()	        --> keys
                    values()	    --> All
                */
                if(request.dbAction && request.dbAction === "get" && request.key) {
                    const d = this.cache.get(request.key);
                    if(d === undefined) {
                        return await response({ error: "Key_is_not_in_Cache" })
                    }
                    return await response({ data: d });
                } else if(request.dbAction && request.dbAction === "clear") {
                    this.cache.clear();
                    return await response({ error: "success_cleared_the_cache" })
                } else if(request.dbAction && request.dbAction === "delete" && request.key) {
                    this.cache.delete(request.key);
                    return await response({ data: "success_deleted_the_cache_key" });
                } else if(request.dbAction && request.dbAction === "has" && request.key) {
                    return await response({ data: this.cache.has(request.key) });
                } else if(request.dbAction && request.dbAction === "set" && request.key && request.data) {
                    const d = this.cache.set(request.key, request.data);
                    if(d instanceof Map) {
                        return await response({ data: "success_set_the_cache" })
                    }
                    return await response({ error: "failed_setting_the_cache" });
                } else if(request.dbAction && (request.dbAction === "values" || request.dbAction === "all")) {
                    return await response({ data: [...this.cache.values()] })
                } else if(request.dbAction && request.dbAction === "entries") {
                    return await response({ data: [...this.cache.entries()] })
                } else if(request.dbAction && request.dbAction === "keys") {
                    return await response({ data: [...this.cache.keys()] })
                } else if(request.dbAction && request.dbAction === "size") {
                    return await response({ data: this.cache.size })
                } else if(request.dbAction && request.dbAction === "add" && request.key && request.data) {
                    const d = this.cache.get(request.key);
                    if(d === undefined) {
                        return await response({ error: "Key_is_not_in_Cache" })
                    }
                    if(typeof d != "number") {
                        return await response({ error: "Data_is_not_a_number" })
                    }
                    const newData = d + data;
                    this.cache.set(request.key, newData);
                    return await response({ data: "success_added_the_amount" });
                } else if(request.dbAction && request.dbAction === "push" && request.key && request.data) {
                    const d = this.cache.get(request.key);
                    if(d === undefined) {
                        return await response({ error: "Key_is_not_in_Cache" })
                    }
                    if(!Array.isArray(d)) {
                        return await response({ error: "Data_is_not_an_array" })
                    }
                    d.push(request.data);
                    this.cache.set(request.key, d);
                    return await response({ data: "success_pushed_the_item" });
                }
                
                
                
                else {
                    await response({ error: "wrong_action_response", request })
                }


            });


            function exitHandler(dbFile, cache) {
                console.log("SAVING THE DATABASE")
                dbFile.set("cacheFile", { data: Array.from(cache)});
                console.log("SAVED THE DATABASE - CLOSING THE PROCESS");
                process.exit();
            }

            //catches ctrl + c event
            process.on('SIGINT', () => exitHandler(this.dbFile, this.cache));

            // catches "kill pid" (for example: nodemon restart)
            process.on('SIGUSR1', () => exitHandler(this.dbFile, this.cache));
            process.on('SIGUSR2', () => exitHandler(this.dbFile, this.cache));
    }
} 


module.exports = RemoteCacheServer;
