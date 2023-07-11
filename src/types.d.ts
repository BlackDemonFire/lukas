export type nil = undefined | null | void;

export type language = {
  command: {
    roll: {
      description: string;
      errors: {
        tooManyArgs: string;
        doubleDiceType: string;
        doubleRollCount: string;
        schroedingersArgument: string;
        noDiceType: string;
        noSides: string;
        rolltypeUndefined: string;
        tooManyDice: string;
        rollcountNotNumeric: string;
        rolltypeNotNumeric: string;
      };
      results: {
        noDice: {
          plaintext: string;
          embed: string;
        };
        singleDice: string;
        multiDice: string;
      };
    };
    restart: {
      description: string;
      start: string;
      success: string;
      error: string;
    };
    purr: {
      description: string;
      singleUser: string[];
    };
    purge: {
      description: string;
      error: {
        notNumeric: string;
      };
    };
    ping: {
      description: string;
      apiLatency: string;
      latency: string;
    };
    pat: {
      description: string;
      singleUser: string[];
      multiUser: string[];
    };
    newgif: {
      description: string;
      wrongArgs: string;
      checking: string;
      success: string;
    };
    new: {
      description: string;
      getPrefix: string;
      getAvatar: string;
      getName: string;
      success: string;
    };
    name: {
      description: string;
      success: string;
    };
    lang: {
      description: string;
      success: string;
      noSuchLanguage: string;
      permissionError: string;
    };
    kiss: {
      description: string;
      singleUser: string[];
      multiUser: string[];
    };
    kill: {
      description: string;
      success: string;
      permissionError: string;
    };
    hug: {
      description: string;
      singleUser: string[];
      multiUser: string[];
    };
    hold: {
      description: string;
      singleUser: string[];
      multiUser: string[];
    };
    help: {
      description: string;
      commandNotFound: string;
      usage: {
        Usage: string;
        args: string;
      };
    };
    giftype: {
      description: string;
      availableTypes: string;
    };
    gifactions: {
      description: string;
      response: string;
    };
    eval: {
      description: string;
      permissionError: string;
    };
    dsarm: {
      description: string;
      args: string;
      noSuchChar: string;
      success: string;
    };
    dsaadd: {
      description: string;
      args: string;
      success: string;
    };
    dsa: {
      description: string;
      contentRequired: string;
      gameMaster: string;
      permissions: string;
    };
    cuddle: {
      description: string;
      singleUser: string[];
      multiUser: string[];
    };
    cry: {
      description: string;
      singleUser: string[];
    };
    color: {
      description: string;
      success: string;
      invalid_color: string;
    };
    blush: {
      description: string;
      singleUser: string[];
    };
  };
  general: {
    timeout: string;
    and: string;
    guildOnly: string;
    userPermissionError: string;
    botPermissionError: string;
  };
  permissions: {
    ADMINISTRATOR: string;
    MANAGE_MESSAGES: string;
  };
};
export type command = {
  run: Function;
  help: {
    show: boolean;
    name: string;
    usage: string;
    category: string;
  };
};
export type dsachar = {
  prefix: string;
  avatar: string;
  displayname: string;
};
