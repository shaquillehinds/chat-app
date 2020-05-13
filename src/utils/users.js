const { addUserToRoom, removeUserFromRoom } = require("./rooms");
const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
  //Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  // Clean the data
  username = username.trim();
  room = room.trim().toLowerCase();

  // Check for existing
  const existingUser = users.find(
    (user) => user.room === room && user.username.toLowerCase() === username.toLowerCase()
  );

  // Validate username
  if (existingUser) {
    return {
      error: "Username is already in use",
    };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);

  //add user to room list
  addUserToRoom(username, room);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    const user = users.splice(index, 1)[0];

    //remove user from room list
    removeUserFromRoom(user.username, user.room);

    return user;
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
