# Muse
Muse is a [Discord](https://discord.com) bot for [Eclipse Phase](https://www.eclipsephase.com/) by [Posthuman Studios, LLC](https://posthumanstudios.com/). 
It was built to help new players with quick rules lookups. When invited to a Discord server, a user can type `muse topic` and 
muse will post what it knows about the topic.

You can invite Muse to your [Discord](https://discord.com) using the following link 
https://discord.com/api/oauth2/authorize?client_id=796356258319564822&permissions=522304&scope=bot

# Your own Muse

## Requirements
If you want to run your own instance of Muse you will need:
* nodejs, v17
* Python
* Postgresql

The bot is built in nodejs. Web management is built in Django. Postgresql is used to store the data.

## Steps

### Create a bot

You will need to [create the bot](https://discordapp.com/developers/applications/) and grab the bot's discord token. 
There are plenty of sites on the web that step you through registering a Discord bot. Google is your friend.

### Create the database

Create the PostgreSQL database.

### Setting up web management

The web manager uses Discord's oauth for user registration.

Set up oauth2 in the discord developer's portal. The redirect will be `https://yourserver/discord/authenticate/`.

Install python. `pip install -r requirements.txt` to install the required Python packages

Copy `settings.py.template` to `settings.py` and update database settings and the discord settings.

Run `manage.py migrate` to create the tables and add initial data.

### Setting up the bot

Install nodejs. `npm install` to load the required packages

Copy `.env.template` to `.env` and update the discord token and muse prefix.

Copy `knexfile.js.template` to `knexfile.js` and update the database settings.

### Your own data

Core data files are in the data folder. While you can edit them, it is cleaner to use a campaign.yaml file 
to hold entries specific to your game. Copy the `campaign.yaml.template` file to `campaign.yaml` and add
your entries there.

#### muse yaml format

The yaml file is a dictionary. The key for each entry is the key used in the look up. keys are case insensitive and 
converted to lower case. The properties of the entries are:
* title: the title of the entry
* page: if included, the page will be included in the entry; page does not need to be numeric
* text: the text for the entry. The maximum length is 2000 characters
* aliases: if present, an array of alternate keys for the same entry
* parent: the parent topic for this topic; in the parent topic, $list will be replaced with the list of child topics
* wiki_slug: if present, the last line in the entry will be a link to the wiki page associated with the topic  

```yaml
sample entry:
  title: Sample Entry
  aliases:
    - sample
  page: 37
  text: >
    This is the text of the entry
category:
  title: Category
  page: 49
  text: >
    This is the description of the category. The subcategories are: $list
sub cat 1:
  title: Sub Category 1
  page: 49
  parent: category
  text: >
    Sub category description
sub b:
  title: Sub B
  page: 50
  parent: category
  text: >
    Info on sub b
external:
  title: External entry
  page: 50
  wiki_slug: external
  text: >
    Info on sub b

```

### Run the servers

Start Django and start the bot.
