const irc = require("irc");

module.exports = function(vorpal) {
  vorpal
    .command("irc")
    .description("Send commands to the bot through IRC")
    .action(function(args, callback) {
      const { host, port, username, channel } = vorpal.config.irc;

      const client = new irc.Client(host, username, {
        channels: [channel],
        userName: username,
        realName: username,
        port: port,
        debug: false,
        showErrors: false,
        autoConnect: true
      });
      client.addListener("message" + channel, function(from, to, message) {
        const command = message.args[1];
        vorpal.exec(command, result => {
          client.say(channel, result);
        });
      });
      client.addListener("pm", function(from, message) {
        client.say(from, `No PM, use the ${channel} channel`);
      });
      client.addListener("error", function(message) {
        console.log("error: ", message);
        client.say(channel, `ERROR: ${JSON.stringify(message)}`);
      });
      client.addListener("join" + channel, function(message) {
        console.log("Connected to IRC");
        client.say(channel, "Hello world");
      });

      vorpal.pipe(stdout => {
        client.say(channel, stdout);
        return stdout;
      });

      console.log("Connecting to IRC...");

      callback();
    });
};
