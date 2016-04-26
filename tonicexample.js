var vdplink=new VDPlink("ws://127.0.0.1:8080");

vdplink.send(n,'squareroot',function(error,result) {
    "The square root of "+n+" is "+result.data;
});