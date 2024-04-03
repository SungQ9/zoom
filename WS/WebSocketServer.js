"use strict";

var _express = _interopRequireDefault(require("express"));
var _http = _interopRequireDefault(require("http"));
var _ws = _interopRequireDefault(require("ws"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var app = (0, _express["default"])();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", _express["default"]["static"](__dirname + "/public"));
app.get("/", function (req, res) {
  return res.render("home");
});
app.get("/*", function (req, res) {
  return res.redirect("/");
}); // 다른 도메인으로 접근시 home으로

var handleListen = function handleListen() {
  return console.log("Listening on http://localhost:3000");
}; // 동일한 포트에서 http 와 ws request 처리 가능

// 같은 서버에서 http,ws 서버 생성
// http 서버 생성
var server = _http["default"].createServer(app);
// http 서버 위에 웹소켓 서버 생성
var wss = new _ws["default"].Server({
  server: server
});
// 연결된 소켓들을 각각 배열에 저장
var sockets = [];

// socket을 로그에 찍음  = socket = 연결된 사람
// 연결되면 handleConnection 함수 호출
wss.on("connection", function (socket) {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("브라우저와 연결되었습니다");
  socket.on("close", function () {
    return console.log("브라우저와의 연결이 해제되었습니다");
  });
  socket.on("message", function (msg) {
    var message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach(function (aSocket) {
          return aSocket.send("".concat(socket.nickname, " :").concat(message.payload));
        });
      case "nickname":
        // Socket에서 nickname으로 들어온 값을 message의 payload로 지정  (누가 보낸 메세지인지 )
        socket["nickname"] = message.payload;
    }

    // 디코딩 작업 ( 한글처리 )
    //const dMessage = Buffer.from(message, "binary").toString("utf-8");
  });
});
server.listen(3000, handleListen);