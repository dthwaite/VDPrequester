/**
 * @file Job request functionality for connection to Volunteer Distributed Processing
 * @author Dominic Thwaites
 * @copyright (c) 2016 Dominic Thwaites dominicthwaites@mac.com
 * @licence MIT
 * @module VDPrequester
 */
module.exports=(/** @lends module:VDPrequester*/function() {
    /**
     * The maximum number of connections that can be made - set to 25.
     * Note that connections for completed jobs are re-used and thus new connections are only made as jobs are requested in parallel.
     * @type {number}
     * @const
     */
    var MAX_CONNECTIONS=25;

    /**
     * Callback function template given when sending a job
     *
     * @callback requestCallback
     * @param {string} errorMessage Error message or null if no error
     * @param {(string|Blob|BufferArray)} resultData The data return from the job
     * @see VDPrequester#send
     */

    /**
     * Class from which any and all cloud jobs are sent to a particular server.
     *
     * Note that connections to the server are only made upon job submission. Thus a bad server
     * address given here will not be immediately apparent.
     *
     * @param {string} address The URL complete with port number that is a VDP server (ws:// ...)
     * @throws {Error} if the address is not a websocket address
     * @constructor
     */
    var VDPrequester=function(address) {
        if (typeof address=='string' && address.substr(0,5)=='ws://') {
            this.url = address;    // server URL
            this.libraries = {};   // VDPrequester holds a set of connections per library name
        } else throw new Error('Invalid server address');
    };

    /**
     * @returns {number} The number of connections open to the VDP server (max 25)
     */
    VDPrequester.prototype.connectionCount=function() {
        var count=0;
        for (var library in this.libraries) {
            count+=this.libraries[library].length;
        }
        return count;
    };

    /**
     * Sends a new job into the cloud.
     *
     * Generally, this is a fire and forget operation. There is no telling how long the job will take or when and who
     * will run the job. If you don't care (unlikely) then you need not provide a callback. But a callback is recommended
     * as it can tell about failures as well as the data results of the job.
     *
     * The library must be a valid name taken from the VDP repository.
     *
     * @param {string} library Name of the execution library to invoke
     * @param {string | Blob | bufferArray} data Input data to the library function
     * @param {requestCallback} [callback] Function called on completion of the job (passing error and result data as a parameter)
     */
    VDPrequester.prototype.send=function(library,data, callback) {
        if (typeof callback!='function') callback=function() {};
        this._send(new Request(library,data, callback,this));
    };

    /**
     * Cancels all outstanding job requests and closes all server connections.
     *
     * This can be used to clean up connections. Requests that have yet to complete are 'forgotten'
     * and thus no response will ever come back. However, those jobs are not cancelled and may or may not
     * complete in the cloud. This request object continues to be operative, however, allowing new requests
     * (and thus new connections) to be made to the server.
     */
    VDPrequester.prototype.disconnect=function() {
        for (var library in this.libraries) {
            var list=this.libraries[library].slice();
            for (var i=0; i<list.length; i++) {
                list[i].available=true;
                list[i].close();
            }
        }
    };

    // Sends one request to the server over a spare connection or a new one if necessary
    VDPrequester.prototype._send=function(request) {
        if (!(request.library in this.libraries)) this.libraries[request.library]=[];
        var list=this.libraries[request.library];
        for (var i = 0; i < list.length; i++) {
            if (list[i].available) {
                request.resetSocket(list[i]).send(request.data);
                return;
            }
        }
        if (this.connectionCount()>=MAX_CONNECTIONS) {
            request.callback('Maximum connection count reached');
        }
        try {
            list[i] = request.resetSocket(new WebSocket(this.url, 'R' + request.library));
            list[i].onopen = function() {
                list[i].send(request.data);
            };
        } catch (error) {
            request.callback('Connection to server refused');
        }
    };

    // Represents one job request
    var Request=function(library,data, callback,vdprequester) {
        this.library=library;
        this.data = data;
        this.vdprequester = vdprequester;
        this.callback = callback;
        this.errors=0;
    };

    // Sets the socket's callbacks in the context of this request
    Request.prototype.resetSocket=function(socket) {
        socket.available=false;
        var me=this;

        socket.onclose=function() {
            var list=me.vdprequester.libraries[me.library];
            // Remove this socket from our store
            list.splice(list.indexOf(socket),1);

            // Resend if we never got a response
            if (me.errors>0) {
                if (me.errors>12) me.callback('Server consistently unavailable');
                else {
                    setTimeout(function() {
                        me.vdprequester._send(me);
                    }, 5000);
                }
            } else {
                // Server purposefully closed this connection - meaning that
                // the message sent was not acceptable
                if (!socket.available) me.callback('Server closed your connection');
            }
        };
        socket.onmessage=function(event) {
            // flag as complete and send the data to the user
            socket.available = true;
            me.callback(null,event.data);
        };
        socket.onerror=function() {
            me.errors++;
        };
        return socket;
    };

    return VDPrequester;
})();
