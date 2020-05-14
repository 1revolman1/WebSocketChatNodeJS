const express = require("express");
const app = express();

const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const fs = require("fs");

let users = [];
let connection = [];
let port = 8080;

//Запуск сервера
server.listen(port, function() {
  console.log("listening on: " + port);
  fs.appendFileSync(
    "./logs/logs.txt",
    `Logs start at port ${port} at ${new Date()}\n\n`
  );
});

//Передача главной страницы на сервер
app.get("/", function(request, respons) {
  var ip =
    request.headers["x-forwarded-for"] || request.connection.remoteAddress;
  console.log(ip);
  respons.render("index.ejs", { ipAdress: ip, connection: connection.length });
});

//Разрешение подключения статических файлов
app.use(express.static("public"));
app.set("view engine", "ejs");

//Инициализация сокетовы
io.sockets.on("connection", function(socket) {
  let generatedCode = Math.random();
  console.log("Успешное соединение! Всего:", connection.length + 1);
  // Добавление нового соединения в массив
  connection.push(socket);

  //Текущее значение соединений
  io.sockets.emit("ammountOfUser", {
    ammountOfUser: connection.length
  });

  socket.on("users-list-toServer", function(data) {
    socket["nickname"] = data.user;
    console.log("На сервере ", socket["nickname"]);
    if (users.indexOf(data.user) == -1) {
      users.push(data.user);
    }
    io.sockets.emit("users-list-fromServer", {
      usersFromServer: users,
      uniqId: generatedCode
    });
  });

  // Функция, которая срабатывает при отключении от сервера
  socket.on("disconnect", function(data) {
    connection.splice(connection.indexOf(socket), 1);
    users.splice(users.indexOf(socket["nickname"]), 1);

    //Текущее значение соединений
    io.sockets.emit("ammountOfUser", {
      ammountOfUser: connection.length
    });
    //Текущее количество пользователей
    io.sockets.emit("users-list-fromServer", { usersFromServer: users });
    console.log("Отключились Всего:", connection.length);
  });

  // Функция получающая сообщение от какого-либо пользователя
  socket.on("send message", function(data) {
    // console.log(data);
    // Внутри функции мы передаем событие 'add mess',
    // которое будет вызвано у всех пользователей и у них добавиться новое сообщение
    io.sockets.emit("add mess", {
      message: data.message,
      image: data.image,
      name: data.name,
      date: data.date,
      ip: data.ip
    });
    let object = {};
    if (data.image == "") {
      object = {
        message: data.message,
        image: "",
        name: data.name,
        date: data.date,
        ip: data.ip
      };
    } else {
      object = {
        message: data.message,
        image: "ОТПРАВКА КАРТИНКИ",
        name: data.name,
        date: data.date,
        ip: data.ip
      };
    }
    console.log(object);
    fs.appendFileSync("./logs/logs.txt", JSON.stringify(object) + "\n");
  });
});
