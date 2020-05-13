const roomsTemplate = document.getElementById("rooms-template").innerHTML;
const modalTemplate = document.getElementById("modal-template").innerHTML;
const $modal = document.getElementById("modal");
const $sidebar = document.getElementById("sidebar");

let rooms = { Empty: "No Rooms" };

const modal = (room) => {
  const html = Mustache.render(modalTemplate, {
    room,
  });
  $modal.innerHTML = html;
  $modal.classList.add("show");

  const $usernameForm = document.getElementById("username-form");
  const $usernameFormButton = document.getElementById("username-form-button");

  $usernameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = $usernameForm.elements.username.value;
    console.log(username, room);
    if (username) {
      const url = `/chat.html?username=${username}&room=${room}`;
      window.location.href = url;
    } else {
      alert("Please Enter Username");
    }
  });
};

const getRooms = async () => {
  try {
    const json = await fetch("/rooms");
    rooms = await json.json();
    if (rooms) {
      console.log(Object.keys(rooms));
      const html = Mustache.render(roomsTemplate, {
        rooms: Object.keys(rooms),
      });
      $sidebar.innerHTML = html;
    }
    return new Promise((resolve, reject) => (rooms ? resolve(rooms) : reject(rooms)));
  } catch (e) {
    console.log(e);
    return new Promise((res, rej) => rej(e));
  }
};

const joinRoomListeners = async () => {
  const res = await getRooms();
  const joinButton = document.querySelectorAll(".join-button");
  joinButton.forEach((button) => {
    button.addEventListener("click", () => {
      const room = button.parentElement.textContent.replace("Join", "");
      modal(room);
    });
  });
};

joinRoomListeners();
