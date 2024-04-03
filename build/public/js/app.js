"use strict";

var socket = io();
var welcome = document.getElementById("welcome");
var form = welcome.querySelector("form");
var room = document.getElementById("room");
room.hidden = true;
var roomName;

// 메세지 받을 떄
function addMessage(message) {
  var ul = room.querySelector("ul");
  var li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

// 메세지 보낼 때
function handleMessageSubmit(event) {
  event.preventDefault();
  var input = room.querySelector("#msg input");
  var value = input.value;
  socket.emit("new_message", input.value, roomName, function () {
    addMessage("\uB2F9\uC2E0: ".concat(value));
  });
  input.value = "";
}

// 닉네임 지정
function handleNicknameSubmit(event) {
  event.preventDefault();
  var input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
}

// 채팅방에 보여지는 부분
function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  var h3 = room.querySelector("h3");
  h3.innerText = "Room ".concat(roomName);
  var msgForm = room.querySelector("#msg");
  var nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}
// 방 들어가기
function handleRoomSubmit(event) {
  event.preventDefault();
  var input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}
form.addEventListener("submit", handleRoomSubmit);
socket.on("welcome", function (user, newCount) {
  var h3 = room.querySelector("h3");
  h3.innerText = "Room ".concat(roomName, " (").concat(newCount, ")");
  addMessage("".concat(user, " \uB2D8\uC774 \uBC29\uC5D0 \uC785\uC7A5\uD558\uC600\uC2B5\uB2C8\uB2E4"));
});
socket.on("bye", function (user, newCount) {
  var h3 = room.querySelector("h3");
  h3.innerText = "Room ".concat(roomName, " (").concat(newCount, ")");
  addMessage("".concat(user, " \uB2D8\uC774 \uBC29\uC744 \uB5A0\uB0AC\uC2B5\uB2C8\uB2E4"));
});
socket.on("new_message", addMessage);
socket.on("room_change", function (rooms) {
  var roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach(function (room) {
    var li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});