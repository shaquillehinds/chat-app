const socket = io();

// Elements

const $messageForm = document.getElementById("message-form");
const $messageFormInput = document.getElementById("message-form-input");
const $messageFormButton = document.getElementById("message-form-button");
const $sendLocation = document.getElementById("send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// Templates
const locationTemplate = document.querySelector("#location-template").innerHTML;
const messageTemplate = document.querySelector("#message-template").innerHTML;
const userTemplate = document.querySelector("#user-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // hieght of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //Visible Height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (data) => {
  const html = Mustache.render(messageTemplate, {
    username: data.username.replace(/^./, data.username[0].toUpperCase()),
    message: data.text,
    createdAt: moment(data.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML(`beforeend`, html);
  autoscroll();
});
socket.on("locationMessage", (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username.replace(/^./, data.username[0].toUpperCase()),
    location: location.text,
    createdAt: moment(location.date).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "true");
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message Delivered!");
  });
});

$sendLocation.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  e.target.setAttribute("disabled", "true");
  navigator.geolocation.getCurrentPosition((position) => {
    const { longitude, latitude } = position.coords;
    socket.emit("sendLocation", { longitude, latitude }, () => {
      console.log("Location shared!");
      e.target.removeAttribute("disabled");
    });
  });
});

socket.on("login", (message) => {
  alert(message);
  window.location.href = "/index.html";
});

socket.on("usersInRoom", ({ room, users }) => {
  console.log(users);

  const html = Mustache.render(userTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    window.location.href = "/index.html";
  }
});