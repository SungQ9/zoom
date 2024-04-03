import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); // 다른 도메인으로 접근시 home으로

const handleListen = () => console.log(`Listening on http://localhost:3000`); // 동일한 포트에서 http 와 ws request 처리 가능

// 같은 서버에서 http,ws 서버 생성
// http 서버 생성
const server = http.createServer(app);
// http 서버 위에 웹소켓 서버 생성
const wss = new WebSocket.Server({ server });
// 연결된 소켓들을 각각 배열에 저장
const sockets = [];

// socket을 로그에 찍음  = socket = 연결된 사람
// 연결되면 handleConnection 함수 호출
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("브라우저와 연결되었습니다");
  socket.on("close", () => console.log("브라우저와의 연결이 해제되었습니다"));
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} :${message.payload}`)
        );
      case "nickname": // Socket에서 nickname으로 들어온 값을 message의 payload로 지정  (누가 보낸 메세지인지 )
        socket["nickname"] = message.payload;
    }

    // 디코딩 작업 ( 한글처리 )
    //const dMessage = Buffer.from(message, "binary").toString("utf-8");
  });
});

server.listen(3000, handleListen);
