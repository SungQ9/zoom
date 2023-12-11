const socket = new WebSocket(`ws://${window.location.host}`);

// 서버로부터의 이벤트 처리

socket.addEventListener("open", () => {
  console.log("서버와 연결되었습니다");
});

socket.addEventListener("message", (message) => {
  console.log("서버로부터의 새 메세지 :", message.data, " 를 받았습니다");
});

socket.addEventListener("close", () => {
  console.log("서버와의 연결이 해제되었습니다");
});

setTimeout(() => {
  socket.send("브라우저에서 보냄 : 안녕 !");
}, 10000);
