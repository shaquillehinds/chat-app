const socket = io();

socket.on("message", (data) => console.log(data));

const form = document.getElementById("message-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message);
  form.elements.message.value = "";
});

const sendLocation = document.getElementById("send-location");

sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const { longitude, latitude } = position.coords;
    socket.emit("sendLocation", { longitude, latitude });
  });
});
