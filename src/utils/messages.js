class GenerateMessage {
  constructor(message, username = "Anon") {
    this.username = username;
    this.text = message;
    this.createdAt = new Date().getTime();
  }
}

module.exports = { GenerateMessage };
