"use strict";

var _express = _interopRequireDefault(require("express"));
var _socket = require("socket.io");
var _adminUi = require("@socket.io/admin-ui");
var _http = _interopRequireDefault(require("http"));
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

var httpServer = _http["default"].createServer(app);
// io
var wsServer = new _socket.Server(httpServer, {
  cors: {
    origin: ["hjttps://admin.sokcet.io"],
    credentials: true
  }
});
(0, _adminUi.instrument)(wsServer, {
  auth: false,
  mode: "development"
});

// 시드와 생성된 방 이름 매치
function publicRooms() {
  var _wsServer$sockets$ada = wsServer.sockets.adapter,
    sids = _wsServer$sockets$ada.sids,
    rooms = _wsServer$sockets$ada.rooms;
  var publicRooms = [];
  rooms.forEach(function (_, key) {
    if (sids.get(key) === undefined) {
      [publicRooms.push(key)];
    }
  });
  return publicRooms;
}
function countRoom(roomName) {
  var _wsServer$sockets$ada2;
  return (_wsServer$sockets$ada2 = wsServer.sockets.adapter.rooms.get(roomName)) === null || _wsServer$sockets$ada2 === void 0 ? void 0 : _wsServer$sockets$ada2.size;
}

// 서버와 연결됐을 떄
wsServer.on("connection", function (socket) {
  socket["nickname"] = "Anon";
  socket.onAny(function (event) {
    console.log(wsServer.sockets.adapter);
    console.log("Socket Event".concat(event));
  });
  // 방에 들어올 때
  socket.on("enter_room", function (roomName, done) {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  // 방에 나갔을 때
  socket.on("disconnecting", function () {
    socket.rooms.forEach(function (room) {
      return socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
  });
  socket.on("disconnect", function () {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  // 메세지 전송 시 대화창
  socket.on("new_message", function (msg, room, done) {
    socket.to(room).emit("new_message", "".concat(socket.nickname, ":").concat(msg));
    done();
  });
  // 닉네임 지정
  socket.on("nickname", function (nickname) {
    return socket["nickname"] = nickname;
  });
});
var handleListen = function handleListen() {
  return console.log("Listening on http://localhost:3000");
}; // 동일한 포트에서 http 와 ws request 처리 가능
httpServer.listen(3000, handleListen);