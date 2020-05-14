var socket = io();

let input_nickname = document.querySelector("#inputNickname");
let button = document.querySelector(".btn-primary");
let textarea = document.getElementById("textPage");
let all_messages = document.querySelector(".message-panel ");

document.addEventListener("DOMContentLoaded", function() {
  if (localStorage.getItem("name") !== null) {
    input_nickname.value = localStorage.getItem("name");
    input_nickname.setAttribute("disabled", "disabled");
    document.querySelector(
      ".text-center p"
    ).textContent = `${localStorage.getItem(
      "name"
    )}, вы можете начать переписку!`;
    socket.emit("users-list-toServer", { user: localStorage.getItem("name") });
  }
});

button.addEventListener("click", function(event) {
  event.preventDefault();
  if (input_nickname.value == "") return;
  if (document.querySelector(".file-form input").files[0]) {
    let file = document.querySelector(".file-form input").files[0];
    if (
      file.type.includes("png") ||
      file.type.includes("jpg") ||
      file.type.includes("jpeg") ||
      file.type.includes("svg")
    ) {
      previewFile();
      document.querySelector(".file-form input").value = "";
      document
        .querySelector(".file-form input")
        .setAttribute("disabled", "disabled");
      document.querySelector(".file-form label").textContent =
        "Картинка(для избежания спама, вы не сможете отправлять картинки чаще чем 10 секунд)";
      setTimeout(e => {
        document.querySelector(".file-form input").removeAttribute("disabled");
        document.querySelector(".file-form label").textContent = "Картинки";
      }, 10000);
      return;
    } else {
      alert("Не пытайся обмануть систему, воришка)");
      document.querySelector(".file-form input").value = "";
    }
  }
  let day = new Date();
  let object = {
    message: textarea.value,
    image: "",
    name: input_nickname.value,
    date: `${day.getDate()}.${day.getMonth() +
      1} ${day.getHours()}:${day.getMinutes()}`,
    ip: document.querySelector("html").getAttribute("ip")
  };
  socket.emit("send message", object);
  textarea.value = "";
});

socket.on("add mess", function(data) {
  // Встраиваем полученное сообщение в блок с сообщениями
  let div = document.createElement("div");
  div.className = "text-block";
  div.innerHTML = `<h6>${data.name}</h6>
  <p>${data.message}</p>
  <img src="${data.image}">
  <span>${data.date}</span>`;
  all_messages.append(div);
  document.querySelector(".message-panel").scrollTop = document.querySelector(
    ".message-panel"
  ).scrollHeight;
});

//Пользователей онлайн
socket.on("ammountOfUser", function(data) {
  document.querySelector(
    ".online-amount"
  ).textContent = `Сейчас на сайте: ${data.ammountOfUser}`;
});
socket.on("users-list-fromServer", function(data) {
  let p = "";
  data.usersFromServer.forEach((element, index) => {
    p += `<p>${String(element)}</p>`;
  });
  document.querySelector(".exampleOfContainer").innerHTML = p;
});

input_nickname.addEventListener("change", function(event) {
  //   console.log(event.srcElement.value);
  input_nickname.setAttribute("disabled", "disabled");
  document.querySelector(
    ".text-center p"
  ).textContent = `${event.srcElement.value}, вы можете начать переписку!`;
  localStorage.setItem("name", event.srcElement.value);
  socket.emit("users-list-toServer", { user: localStorage.getItem("name") });
});

function previewFile() {
  var file = document.querySelector(".file-form input").files[0];
  let reader = new FileReader();
  reader.onloadend = function() {
    let day = new Date();
    let object = {
      message: textarea.value,
      image: reader.result,
      name: localStorage.getItem("name"),
      date: `${day.getDate()}.${day.getMonth() +
        1} ${day.getHours()}:${day.getMinutes()}`,
      ip: document.querySelector("html").getAttribute("ip")
    };
    socket.emit("send message", object);
  };
  if (file) {
    reader.readAsDataURL(file);
  }
}
