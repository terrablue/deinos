import parse from "./parse.js";

export default test => {
  // https://www.rfc-editor.org/rfc/rfc1459#section-4.4.1
  test.case("PRIVMSG", assert => {
    [
      [
        ":Angel PRIVMSG Wiz :Hello are you receiving this message ?",
        {
          tag: undefined,
          prefix: ":Angel",
          command: "PRIVMSG",
          params: [
            "Wiz", ":Hello", "are", "you", "receiving", "this", "message", "?",
          ],
        },
      ],
      [
        "PRIVMSG Angel :yes I'm receiving it !receiving it !'u>(768u+1n) .br ;",
        {
          tag: undefined,
          prefix: undefined,
          command: "PRIVMSG",
          params: [
            "Angel", ":yes", "I'm", "receiving", "it", "!receiving", "it",
            "!'u>(768u+1n)", ".br", ";",
          ],
        },
      ],
      [
        "PRIVMSG jto@tolsun.oulu.fi :Hello !",
        {
          tag: undefined,
          prefix: undefined,
          command: "PRIVMSG",
          params: [
            "jto@tolsun.oulu.fi", ":Hello", "!",
          ],
        },
      ],
    ].forEach(([raw, parsed]) => {
      assert(parse(`${raw}\r`)).equals([parsed]);
    });
  });
  // https://www.rfc-editor.org/rfc/rfc1459#section-4.4.2
  test.case("NOTICE", assert => {
    [
      [
        ":silver.libera.chat NOTICE * :*** Checking Ident",
        {
          tag: undefined,
          prefix: ":silver.libera.chat",
          command: "NOTICE",
          params: [
            "*", ":***", "Checking", "Ident",
          ],
        },
      ],
    ].forEach(([raw, parsed]) => {
      assert(parse(`${raw}\r`)).equals([parsed]);
    });
  });
};
