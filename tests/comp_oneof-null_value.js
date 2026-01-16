var tape = require("tape");

var protobuf = require("..");

var proto = 'syntax = "proto3";\
import "google/protobuf/struct.proto";\
message TestMessage {\
    oneof payload {\
        string text = 1;\
        google.protobuf.NullValue nothing = 2;\
    }\
}';

tape.test("NullValue in oneof", function(test) {
    var root = new protobuf.Root();
    root.addJSON(protobuf.common["google/protobuf/struct.proto"].nested);
    protobuf.parse(proto, root);
    root.resolveAll();
    
    var TestMessage = root.lookupType("TestMessage");
    
    var msg1 = TestMessage.fromObject({ text: "hello" });
    test.equal(msg1.text, "hello", "should set text");
    test.equal(msg1.payload, "text", "should set oneof to text");
    test.notOk(msg1.hasOwnProperty("nothing"), "should not set nothing");
    
    var msg2 = TestMessage.fromObject({ nothing: "NULL_VALUE" });
    test.equal(msg2.nothing, "NULL_VALUE", "should set nothing");
    test.equal(msg2.payload, "nothing", "should set oneof to nothing");
    test.notOk(msg2.hasOwnProperty("text"), "should not set text");
    
    var msg3 = TestMessage.fromObject({});
    test.notOk(msg3.hasOwnProperty("text"), "empty: should not set text");
    test.notOk(msg3.hasOwnProperty("nothing"), "empty: should not set nothing");
    test.equal(msg3.payload, undefined, "empty: oneof should be undefined");
    
    var encoded = TestMessage.encode(msg1).finish();
    var decoded = TestMessage.decode(encoded);
    test.equal(decoded.text, "hello", "roundtrip: text preserved");
    test.equal(decoded.payload, "text", "roundtrip: oneof preserved");

    test.end();
});