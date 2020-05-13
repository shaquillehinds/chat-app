const rooms = {};

//add new user to room

const addUserToRoom = (user, room) => {
  rooms[room] ? rooms[room].push(user) : (rooms[room] = [user]);
  return rooms[room];
};

// remove user from room
const removeUserFromRoom = (user, room) => {
  if (rooms[room]) {
    const index = rooms[room].findIndex((member) => member.toLowerCase() === user.toLowerCase());
    rooms[room].splice(index, 1);
  }
  if (rooms[room].length === 0) {
    delete rooms[room];
  }
  return rooms[room];
};

module.exports = {
  rooms,
  addUserToRoom,
  removeUserFromRoom,
};
