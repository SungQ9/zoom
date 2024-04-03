"use strict";

var messageList = document.querySelector("ul");
var nickForm = document.querySelector("#nick");
var messageForm = document.querySelector("#message");
var socket = new WebSocket("ws://".concat(window.location.host));

// JSON 을 String 처리
function makeMessage(type, payload) {
  //  type과 payload로 나눔
  var msg = {
    type: type,
    payload: payload
  };
  return JSON.stringify(msg);
}

// 서버로부터의 이벤트 처리
socket.addEventListener("open", function () {
  console.log("서버와 연결되었습니다");
});
socket.addEventListener("message", function (message) {
  // html에 li를 만들고 message의 data에서 text를 가져와서 messageList에 append
  var li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});
socket.addEventListener("close", function () {
  console.log("서버와의 연결이 해제되었습니다");
});
function handleSubmit(event) {
  event.preventDefault();
  var input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  var li = document.createElement("li");
  li.innerText = "\uB2F9\uC2E0: ".concat(input.value);
  messageList.append(li);
  input.value = "";
}
function handleNickSubmit(event) {
  event.preventDefault();
  var input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
}
messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);