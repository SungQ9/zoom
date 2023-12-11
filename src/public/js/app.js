const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

const socket = new WebSocket(`ws://${window.location.host}`);

// JSON 을 String 처리
function makeMessage(type, payload) {
  //  type과 payload로 나눔
  const msg = { type, payload };
  return JSON.stringify(msg);
}

// 서버로부터의 이벤트 처리
socket.addEventListener("open", () => {
  console.log("서버와 연결되었습니다");
});

socket.addEventListener("message", (message) => {
  // html에 li를 만들고 message의 data에서 text를 가져와서 messageList에 append
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("서버와의 연결이 해제되었습니다");
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  input.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
