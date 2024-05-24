import tls from "node:tls";
import O from "rcompat/object";
import FS from "rcompat/fs";
import { maybe } from "rcompat/invariant";
import parse from "./parse.js";
import * as extensions from "./extensions/exports.js";

const defaults = await new FS.File(import.meta.dirname).join("defaults.json")
  .json();

const events = {
  privmsg({ tag, prefix, params }) {
    return ["message", {
      nick: prefix,
      to: params[0],
      message: params[1].slice(1),
    }];
  },
  ping({ params }, client) {
    client.send("PONG", params[0]);
  },
  cap({ params }) {
    console.log("capability acknowledged", params);
  },
};

export default class Client {
  #config = {};
  #connection;
  #events = [];

  constructor(config) {
    maybe(config).object();

    this.#config = O.defaults(config, defaults);
  }

  send(message) {
    this.#connection.write(`${message}\r\n`);
  }

  nick(nickname) {
    this.send(`NICK ${nickname}`);
  }

  user(user, realname = user) {
    this.send(`USER ${user} 8 * ${realname}`);
  }

  join(channel) {
    this.send(`JOIN ${channel}`);
  }

  capreq(capability) {
    this.send(`CAP REQ ${capability}`);
  }

  on(event, handler) {
    this.#events.push({ event, handler });
  }

  get(key) {
    return O.get(this.#config, key);
  }

  #setup() {
    this.nick(this.get("nick"));
    this.user(this.get("user"));
    Object.entries(this.get("extensions"))
      .filter(([name, config]) =>
        config !== false && extensions[name] !== undefined)
      .forEach(([name, config]) => extensions[name](this, config));
    this.get("channels").forEach(channel => this.join(channel));
  }

  connect() {
    let resolve;
    const connected = new Promise(r => {
      resolve = r;
    });

    this.#connection = tls.connect(this.get("network"), () => {
      this.#setup();
      resolve();
    });

    this.#connection.addListener("data", data => {
      const messages = parse(data.toString());
      for (const { command, ...rest } of messages) {
        const [name, payload] = events[command.toLowerCase()]?.(rest, this) ?? [command.toLowerCase(), { ...rest }];
        this.#events.filter(({ event }) => event === name)
          .map(({ handler }) => handler(payload));
      }
    });
    this.#connection.addListener("end", () => {
      console.error("unimplemented `end`");
    });
    this.#connection.addListener("close", () => {
      console.error("unimplemented `close`");
    });

    return connected;
  }
}
