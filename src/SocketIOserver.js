import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import http from "http";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); // 다른 도메인으로 접근시 home으로

const httpServer = http.createServer(app);
// io
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["hjttps://admin.sokcet.io"],
    credentials: true,
  },
});
instrument(wsServer, {
  auth: false,
  mode: "development",
});

// 시드와 생성된 방 이름 매치
function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      [publicRooms.push(key)];
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

// 서버와 연결됐을 떄
wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event${event}`);
  });
  // 방에 들어올 때
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  // 방에 나갔을 때
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  // 메세지 전송 시 대화창
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}:${msg}`);
    done();
  });
  // 닉네임 지정
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

const handleListen = () => console.log(`Listening on http://localhost:3000`); // 동일한 포트에서 http 와 ws request 처리 가능
httpServer.listen(3000, handleListen);
