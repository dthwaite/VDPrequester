var assert=chai.assert;
//window.initMochaPhantomJS();
window.WebSocket=function() {

};
describe('VDP Requester', function() {
    before(function () {
        this.clock = sinon.useFakeTimers();
    });

    after(function () {
        this.clock.restore();
    });

    beforeEach(function() {
        this.ws=sinon.stub(window,"WebSocket");
        this.sendSpy=sinon.spy();
        WebSocket.prototype.send=this.sendSpy;
        WebSocket.prototype.close=function() {
            this.onclose();
        };
    });
    afterEach(function() {
        this.ws.restore();
    });
    it('Create a new link', function () {
        assert.equal(new VDPrequester("ws://127.0.0.1:8080").url, "ws://127.0.0.1:8080");
        assert.throws(function() {
            new VDPrequester("http://127.0.0.1:8080");
        },"Invalid server address")
    });
    it('Attempt to send given no connection',function() {
        var data='data';
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();
        this.ws.throws();
        vdprequester.send(library,data,callback);
        assert.equal(window.WebSocket.calledWithExactly(url,"R"+library),true);
        assert.equal(callback.calledWith('Connection to server refused'),true);
    });
    it('Successful first send',function() {
        var data='data';
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();
        vdprequester.send(library,data,callback);
        assert.equal(window.WebSocket.calledWithExactly(url,"R"+library),true);
        assert.equal(callback.calledWith('Connection to server refused'),false);
        vdprequester.libraries[library][0].onopen();
        assert.equal(this.sendSpy.calledWithExactly(data),true);
    });
    it('Successful first send with server closing',function() {
        var data='data';
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();
        vdprequester.send(library,data,callback);
        vdprequester.libraries[library][0].onopen();
        vdprequester.libraries[library][0].onclose();
        assert.equal(callback.calledWith('Server closed your connection'),true);
    });
    it('Initial failure to send followed by success',function() {
        var data='data';
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();
        vdprequester.send(library,data,callback);
        var connection=vdprequester.libraries[library][0];
        connection.onopen();
        connection.onerror();
        connection.onclose();
        this.clock.tick(5000);
        var connection=vdprequester.libraries[library][0];
        connection.onopen();
        assert.equal(this.sendSpy.calledTwice,true);
    });
    it('Repeated failure beyond 1 minute to send',function() {
        var data='data';
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();
        vdprequester.send(library,data,callback);
        for (var i=0;i<12;i++) {
            var connection = vdprequester.libraries[library][0];
            connection.onopen();
            connection.onerror();
            connection.onclose();
            this.clock.tick(5000);
        }
        assert.equal(callback.callCount,0);
        var connection = vdprequester.libraries[library][0];
        connection.onopen();
        connection.onerror();
        connection.onclose();
        this.clock.tick(5000);
        assert.equal(callback.calledWith('Server consistently unavailable'),true);
    });
    it('Two separate library requests',function() {
        var data1='data-1';
        var data2='data-2';
        var url="ws://127.0.0.1:8080";
        var library1="my-lib-1";
        var library2="my-lib-2";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();

        vdprequester.send(library1,data1,callback);
        vdprequester.libraries[library1][0].onopen();
        vdprequester.send(library2,data2,callback);
        vdprequester.libraries[library2][0].onopen();
        assert.equal(this.sendSpy.getCall(0).calledWithExactly(data1),true);
        assert.equal(this.sendSpy.getCall(1).calledWithExactly(data2),true);
    });
    it('Two same library requests',function() {
        var data1='data-1';
        var data2='data-2';
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();

        vdprequester.send(library,data1,callback);
        vdprequester.libraries[library][0].onopen();
        vdprequester.send(library,data2,callback);
        vdprequester.libraries[library][1].onopen();
        assert.equal(this.sendSpy.getCall(0).calledWithExactly(data1),true);
        assert.equal(this.sendSpy.getCall(1).calledWithExactly(data2),true);
    });
    it('Successful first send with response',function() {
        var data='data';
        var result="result";
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();

        vdprequester.send(library,data,callback);
        vdprequester.libraries[library][0].onopen();
        vdprequester.libraries[library][0].onmessage({data:result});
        assert.equal(this.sendSpy.calledWithExactly(data),true);
        assert.equal(callback.calledWithExactly(null,result),true);
    });
    it('Successful first send without callback',function() {
        var data='data';
        var result="result";
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();

        vdprequester.send(library,data);
        vdprequester.libraries[library][0].onopen();
        vdprequester.libraries[library][0].onmessage({data:result});
        assert.equal(this.sendSpy.calledWithExactly(data),true);
    });
    it('Two same library requests with responses',function() {
        var data1='data-1';
        var data2='data-2';
        var result1='result-1';
        var result2='result-2';
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();
        vdprequester.send(library,data1,callback);
        vdprequester.libraries[library][0].onopen();
        vdprequester.send(library,data2,callback);
        vdprequester.libraries[library][1].onopen();
        vdprequester.libraries[library][1].onmessage({data:result2});
        vdprequester.libraries[library][0].onmessage({data:result1});
        assert.equal(callback.getCall(0).calledWithExactly(null,result2),true);
        assert.equal(callback.getCall(1).calledWithExactly(null,result1),true);
    });
    it('Successive same library requests',function() {
        var data='data';
        var result="result";
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var vdprequester=new VDPrequester(url);
        var callback=sinon.spy();
        vdprequester.send(library,data,callback);
        vdprequester.libraries[library][0].onopen();
        vdprequester.libraries[library][0].onmessage({data:result});
        assert.equal(callback.calledOnce,true);

        vdprequester.send(library,data,callback);
        vdprequester.libraries[library][0].onopen();
        vdprequester.libraries[library][0].onmessage({data:result});
        assert.equal(callback.calledTwice,true);

        assert.equal(this.ws.calledOnce,true);
    });
    it('Maximum connections',function() {
        var data='data';
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var callback=sinon.spy();
        var vdprequester=new VDPrequester(url);
        for (var i=0;i<25;i++) {
            vdprequester.send(library, data, function(){});
            vdprequester.libraries[library][i].onopen();
            assert.equal(this.sendSpy.callCount,i+1);
        }
        vdprequester.send(library, data, callback);
        assert.equal(callback.calledWith('Maximum connection count reached'),true);
    });
    it('Disconnect',function() {
        var data='data';
        var result="result";
        var url="ws://127.0.0.1:8080";
        var library="my-lib";
        var callback1=sinon.spy();
        var callback2=sinon.spy();
        var callback3=sinon.spy();
        var callback4=sinon.spy();
        var vdprequester=new VDPrequester(url);
        vdprequester.send(library, data, callback1);
        vdprequester.send(library, data, callback2);
        vdprequester.libraries[library][1].onopen();
        vdprequester.send(library, data, callback3);
        vdprequester.libraries[library][2].onopen();
        vdprequester.libraries[library][2].onmessage({data:result});
        vdprequester.send(library, data, callback4);
        assert.equal(callback1.called,false);
        assert.equal(callback2.called,false);
        assert.equal(callback3.calledWithExactly(null,result),true);
        assert.equal(callback4.called,false);
        assert.equal(vdprequester.connectionCount(),3);
        vdprequester.disconnect();
        assert.equal(vdprequester.connectionCount(),0);
        assert.equal(callback1.called,false);
        assert.equal(callback2.called,false);
        assert.equal(callback3.calledOnce,true);
        assert.equal(callback4.called,false);
    });
});