# Muse
Muse is a [Discord](https://discord.com) bot for [Eclipse Phase](https://www.eclipsephase.com/) . It was built
to help new players with quick rules lookups. When invited to a Discord server, a user can type `muse topic` and 
muse will post what it knows about the topic.

You can invite Muse to your [Discord](https://discord.com) using the following link 
https://discord.com/api/oauth2/authorize?client_id=796356258319564822&permissions=522304&scope=bot

# Your own Muse

## Requirements
If you want to run your own instance of Muse you will need:
* nodejs
* Python
* Postgresql

The bot is built in nodejs. Web management is built in Django. Postgresql is used to store the data.

## Steps

### Create a bot

You will need to [create the bot](https://discordapp.com/developers/applications/) and grab the bot's discord token. 
There are plenty of sites on the web that step you through registering a Discord bot. Google is your friend.

### Create the database

No need to create any tables at this point.

### Setting up the bot
Install nodejs. `npm install` to load the required packages

Copy `.env.template` to `.env` and update the discord token and muse prefix.

Copy `knexfile.js.template` to `knexfile.js` and update the database settings.

### Setting up web management

The web manager uses Discord's oauth for user registration.

Install python. `pip install -r requirements.txt` to install the required Python packages

Copy `settings.py.template` to `settings.py` and update database settings and the secret key.

### Your own data

Core data files are in the data folder. While you can edit them, it is cleaner to use a campaign.yaml file 
to hold entries specific to your game. Copy the `campaign.yaml.template` file to `campaign.yaml` and add
your entries there.

### Run the servers

Start Django and start the bot.
