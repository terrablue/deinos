const re = /^(?<tag>@.*? )?(?<prefix>:.*? )?(?<command>\w*) ?(?<params>.*)\r$/u;

const parse_message = message => {
  const { tag, prefix, command, params } = message.match(re).groups;

  return {
    tag: tag?.trim(),
    prefix: prefix?.trim(),
    command,
    params: params?.split(" ").map(param => param.trim()),
  };
};

const gt0_string = line => line !== "";

export default data => data.split("\n").filter(gt0_string).map(parse_message);
