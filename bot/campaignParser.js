const YAML = require("js-yaml");
const logger = require("./logger");

const maxKeyLength = 100;
const maxTextLength = 2000;
const MaxSlugLength = 200;
const validKeys = ['text', 'aliases', 'page', 'parent', 'wiki_slug', 'category', 'image'];

const validateKey = (key) => {
  if (key.length > maxKeyLength)
    return `${key} exceeds max length of ${maxKeyLength}`;
  if (key.startsWith('-'))
    return `${key} cannot start with a -`;
  if (key.startsWith(' '))
    return `${key} cannot start with a space`;
  if (key.endsWith(' '))
    return `${key} cannot end with a space`;
  if (key.includes('  '))
    return `${key} cannot have multiple spaces`;

  return null;
}

const campaignParser = async (text) => {
  try {
    const y = YAML.load(text);
    const keys = Object.keys(y);
    for (const key of keys) {
      const entry = y[key];
      const keyCheck = validateKey(key);
      if (keyCheck)
        return {entries: null, error: keyCheck};
      if (!('text' in entry))
        return {entries: null, error: `${key} has no text`};
      if (entry.text.length > maxTextLength)
        return {entries: null, error: `${key} text exceeds max length of ${maxTextLength}`};
      const attrs = Object.keys(entry);
      for (const attribute of attrs) {
        if (!validKeys.includes(attribute))
          return {entries: null, error: `${key} has an invalid attribute: ${attribute}`};
        if (attribute === 'aliases') {
          if (!Array.isArray(entry.aliases))
            return {entries: null, error: `${key} aliases must be a list`};
          for (const alias of entry.aliases) {
            const aliasCheck = validateKey(alias);
            if (aliasCheck)
              return {entries: null, error: aliasCheck};
          }
        } else {
          if (typeof entry[attribute] !== 'string' && !Number.isInteger(entry[attribute]))
            return {entries: null, error: `${key} ${attribute} is an invalid data type`};
          if (attribute === 'parent') {
            const parentCheck = validateKey(entry.parent);
            if (parentCheck)
              return {entries: null, error: parentCheck};
          } else if (attribute === 'wiki_slug') {
            if (entry.wiki_slug.length > MaxSlugLength)
              return {entries: null, error: `wiki_slug exceeds max length of ${MaxSlugLength}`};
          }
        }
      }
    }

    return {entries: y, error: null};
  } catch (e) {
    logger.error(e);
    return {entries: null, error: 'not a valid yaml file'}
  }
}

module.exports = campaignParser;
