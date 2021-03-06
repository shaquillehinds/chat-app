const socket = io();

// Elements

const $messageForm = document.getElementById("message-form");
const $messageFormInput = document.getElementById("message-form-input");
const $messageFormButton = document.getElementById("message-form-button");
const $sendLocation = document.getElementById("send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");
const $sideToggle = document.getElementById("show_sidebar");
const $sendImage = document.getElementById("send_image");

// Templates
const locationTemplate = document.querySelector("#location-template").innerHTML;
const messageTemplate = document.querySelector("#message-template").innerHTML;
const userTemplate = document.querySelector("#user-template").innerHTML;

// SideBar Toggle
if ($sideToggle) {
  $sideToggle.addEventListener("click", (e) => {
    $sidebar.classList.toggle("show");
  });
}

// Send Image
$sendImage.onchange = (e) => {
  if (e.target.files[0]) {
    const image = e.target.files[0];
    socket.emit("sendImage", image, (acknowledge) => {
      console.log(acknowledge);
    });
  }
};

//let global name;
let name;

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

  if (containerHeight - newMessageHeight * 2 <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};
let initialScrollHeight = $messages.scrollHeight;
const observer = new MutationObserver(function (mutations, me) {
  const newHeight = mutations[0].target.scrollHeight;
  if (initialScrollHeight < newHeight) {
    autoscroll();
    initialScrollHeight = newHeight;
    return;
  }
});
observer.observe($messages, {
  childList: true,
});

socket.on("message", (data) => {
  if (data.text.match(/welcome\s/gi) && data.username === "Admin") {
    name = data.text.replace("Welcome ", "").toLowerCase();
  }
  let messageClass, messageWrapperClass;
  if (name === data.username.toLowerCase()) {
    messageClass = "messages__user";
    messageWrapperClass = "messages__user--wrapper";
  } else {
    messageClass = "messages__other";
    messageWrapperClass = "messages__other--wrapper";
  }
  const html = Mustache.render(messageTemplate, {
    username: data.username.replace(/^./, data.username[0].toUpperCase()),
    message: data.text,
    messageClass,
    messageWrapperClass,
    createdAt: moment(data.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML(`beforeend`, html);
});
socket.on("image", async (data) => {
  const imageBufferString = "data:image/jpeg;base64," + data.text;
  const imgElement = document.createElement("img");
  imgElement.src = imageBufferString;
  imgElement.className = "chat_img";
  if (data.username.toLowerCase() === name) imgElement.classList.add("messages__user--wrapper");
  imgElement.onclick = () => {
    const image = new Image();
    image.src = imageBufferString;
    const newWindow = window.open("");
    newWindow.document.write(image.outerHTML);
    newWindow.stop();
  };
  const div = document.createElement("div");
  div.classList.add("message");
  div.appendChild(imgElement);
  $messages.insertAdjacentElement("beforeend", div);
});
socket.on("locationMessage", (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username.replace(/^./, location.username[0].toUpperCase()),
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
  const html = Mustache.render(userTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
  const $hideSidebar = document.getElementById("hide_sidebar");
  if ($hideSidebar) {
    $hideSidebar.addEventListener("click", (e) => {
      $sidebar.classList.toggle("show");
    });
  }
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    window.location.href = "/index.html";
  }
});
