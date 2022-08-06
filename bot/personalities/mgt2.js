"use strict"
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const BasePersonality = require("./base");
const cache = require("../cache");
const axios = require("axios");
const AWS = require('aws-sdk');
const logger = require("../logger");

const {MessageEmbed} = require("discord.js");
const TravellerBase = require("./travellerbase");

const UWPRegex = /(.)(.)(.)(.)(.)(.)(.)-(.)/;
const TRAVELLER_MAP_URL = 'https://travellermap.com';

const s3 = new AWS.S3({
  region: process.env.EB_AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});

const GOVERNMENTS = {
  "0": {
    "type": "None",
    "description": "No government structure. In many cases, family bonds predominate",
    "examples": "Family, Clan, Anarchy",
    "contraband": "None",
  },
  "1": {
    "type": "Company/Corporation",
    "description": "Ruling functions are assumed by a company managerial elite, and most citizenry are company employees or dependants",
    "examples": "Corporate outpost, asteroid mining, feudal domain",
    "contraband": "Weapons, Drugs, Travellers",
  },
  "2": {
    "type": "Participating Democracy",
    "description": "",
    "examples": "",
    "contraband": "",
  },
  "3": "Self-Perpetuating Oligarchy",
  "4": "Representative Democracy",
  "5": "Feudal Technocracy",
  "6": "Captive Governemnt",
  "7": "Balkinisation",
  "8": "Civil Service Bureaucracy",
  "9": "Impersonal Bureaucracy",
  "A": "Charismatic Dictator",
  "B": "Non-Charismatic Leadeer",
  "C": "Charismatic Oligrachy",
  "D": "Religious Distaorsahip",
  "E": "Religious Autocracy",
  "F": "Totalitarian Oligarchy"
};

const HYDROSPHERES = {
  "0": {
    "min": 0,
    "max": 5,
    "description": "Desert world"
  },
  "1": {
    "min": 6,
    "max": 15,
    "description": "Dry world"
  },
  "2": {
    "min": 16,
    "max": 25,
    "description": "A few small seas"
  },
  "3": {
    "min": 26,
    "max": 35,
    "description": "Small seas and oceans"
  },
  "4": {
    "min": 36,
    "max": 45,
    "description": "Wet world"
  },
  "5": {
    "min": 46,
    "max": 55,
    "description": "Large oceans"
  },
  "6": {
    "min": 56,
    "max": 65,
    "description": ""
  },
  "7": {
    "min": 66,
    "max": 75,
    "description": "Earth-like world"
  },
  "8": {
    "min": 76,
    "max": 85,
    "description": "Water World"
  },
  "9": {
    "min": 86,
    "max": 95,
    "description": "Only a few small islands"
  },
  "A": {
    "min": 96,
    "max": 100,
    "description": "Almost entirely water"
  }
};

const LAW_LEVELS = {
  "0": {
    "weaponsBanned": "No",
    "armourBanned": "No"
  },
  "1": {
    "weaponsBanned": "Poison Gas, Explosives, Undetectable Weapons and WMD",
    "armourBanned": "Battle Dress"
  },
  "2": {
    "weaponsBanned": "Portable energy, Laser, Poison Gas, Explosives, Undetectable Weapons and WMD",
    "armourBanned": "Combat Armour, Battle Dress"
  },
  "3": {
    "weaponsBanned": "Military, Portable energy, Laser, Poison Gas, Explosives, Undetectable Weapons and WMD",
    "armourBanned": "Flak, Combat Armour, Battle Dress"
  },
  "4": {
    "weaponsBanned": "Submachine guns, light assault, Military, Portable energy, Laser, Poison Gas, Explosives, Undetectable Weapons and WMD",
    "armourBanned": "Cloth, Flak, Combat Armour, Battle Dress"
  },
  "5": {
    "weaponsBanned": "Personal Concealable Weapons, Submachine guns, light assault, Military, Portable energy, Laser, Poison Gas, Explosives, Undetectable Weapons and WMD",
    "armourBanned": "Mesh, Cloth, Flak, Combat Armour, Battle Dress"
  },
  "6": {
    "weaponsBanned": "All Firearms, except shotguns and stunners",
    "armourBanned": "Cloth, Flak, Combat Armour, Battle Dress"
  },
  "7": {
    "weaponsBanned": "All Firearms, including Shotguns",
    "armourBanned": "Cloth, Flak, Combat Armour, Battle Dress"
  },
  "8": {
    "weaponsBanned": "All bladed weapons, stunners and all firearms",
    "armourBanned": "All visible"
  },
  "9": {
    "weaponsBanned": "All Weapons",
    "armourBanned": "All"
  },
  "A": {
    "weaponsBanned": "All Weapons",
    "armourBanned": "All"
  },
};

const PLANET_SIZES = {
  "0": {
    "diameter": "Less than 1,000km",
    "gravity": "Negligable"
  },
  "1": {
    "diameter": "1,600km",
    "gravity": "0.05"
  },
  "2": {
    "diameter": "3,200km",
    "gravity": "0.15"
  },
  "3": {
    "diameter": "4,800km",
    "gravity": "0.25"
  },
  "4": {
    "diameter": "6,400km",
    "gravity": "0.35"
  },
  "5": {
    "diameter": "8,000km",
    "gravity": "0.45"
  },
  "6": {
    "diameter": "9,600km",
    "gravity": "0.7"
  },
  "7": {
    "diameter": "11,200km",
    "gravity": "0.9"
  },
  "8": {
    "diameter": "12,800km",
    "gravity": "1"
  },
  "9": {
    "diameter": "14,400km",
    "gravity": "1.25"
  },
  "A": {
    "diameter": "16,000km",
    "gravity": "1.4"
  }
};

const starPorts = {
  "A": {
    "quality": "Excellent",
    "berthingCost": "1DxCR1000",
    "fuelAvailable": "Refined"
  },
  "B": {
    "quality": "Good",
    "berthingCost": "1DxCR500",
    "fuelAvailable": "Refined"
  },
  "C": {
    "quality": "Routine",
    "berthingCost": "1DxCR100",
    "fuelAvailable": "Unrefined"
  },
  "D": {
    "quality": "Poor",
    "berthingCost": "1DxCR10",
    "fuelAvailable": "Unrefined"
  },
  "E": {
    "quality": "Frontier",
    "berthingCost": "0",
    "fuelAvailable": "None"
  },
  "X": {
    "quality": "None",
    "berthingCost": "0",
    "fuelAvailable": "None"
  }
};

const TECH_LEVELS = {
  "0": {
    "level": "0",
    "shortDescription": "Primitive",
    "technologyAge": "Stone Age",
    "details": "No technology. TL 0 species have only discovered the simplest tools and principles, and are on a par with Earth’s Stone Age."
  },
  "1": {
    "level": "1",
    "shortDescription": "Primitive",
    "technologyAge": "Iron Age",
    "details": "Roughly on a par with Bronze or Iron age technology. TL 1 science is mostly superstition, but they can manufacture weapons and work metals."
  },
  "2": {
    "level": "2",
    "shortDescription": "Primitive",
    "technologyAge": "Renaissance Era",
    "details": " Renaissance technology. TL 2 brings with it a greater understanding of chemistry, physics, biology and astronomy as well as the scientific method. "
  },
  "3": {
    "level": "3",
    "shortDescription": "Primitive",
    "technologyAge": "Steam Age",
    "details": "The advances of TL 2 are now applied, bringing the germ of industrial revolution and steam power. Primitive firearms now dominate the battlefield. This is roughly comparable to the early 19th century."
  },
  "4": {
    "level": "4",
    "shortDescription": "Industrial",
    "technologyAge": "Industrial Revolution",
    "details": "The transition to industrial revolution is complete, bringing plastics, radio and other such inventions. Roughly comparable to the late 19th/early 20th century. "
  },
  "5": {
    "level": "5",
    "shortDescription": "Industrial",
    "technologyAge": "Combustion Age",
    "details": "TL 5 brings widespread electrification, tele-communications and internal combustion. At the high end of the TL, atomics and primitive computing appear. Roughly on a par with the mid–20th century."
  },
  "6": {
    "level": "6",
    "shortDescription": "Industrial",
    "technologyAge": "Space Age",
    "details": "TL 6 brings the development of fission power and more advanced computing. Advances in materials technology and rocketry bring about the dawn of the space age."
  },
  "7": {
    "level": "7",
    "shortDescription": "Pre-Stellar",
    "technologyAge": "Near Planet Orbit",
    "details": "A pre-stellar society can reach orbit reliably and has telecommunications satellites. Computers become common. At the time of writing, humanity is currently somewhere between TL 7 and TL 8."
  },
  "8": {
    "level": "8",
    "shortDescription": "Pre-Stellar",
    "technologyAge": "Space Habitats",
    "details": "At TL 8, it is possible to reach other worlds in the same system, although terraforming or full colonisation are not within the culture’s capacity. Permanent space habitats become possible. Fusion power becomes commercially viable."
  },
  "9": {
    "level": "9",
    "shortDescription": "Pre-Stellar",
    "technologyAge": "Gravity Control",
    "details": "The defining element of TL 9 is the development of gravity manipulation, which makes space travel vastly safer and faster. This research leads to development of the jump drive, which occurs near the end of this Tech Level. TL 9 cultures can colonise other worlds, although travelling to a colony is often a one-way trip."
  },
  "A": {
    "level": "10",
    "shortDescription": "Early Stellar",
    "technologyAge": "Jump Drives",
    "details": "With the advent of commonly available jump drives, nearby systems are opened up. Orbital habitats and factories become common. Interstellar travel and trade lead to an economic boom. Colonies become much more viable."
  },
  "B": {
    "level": "11",
    "shortDescription": "Early Stellar",
    "technologyAge": "Artificial Intelligence",
    "details": "The first true artificial intelligences become possible, as computers are able to model synaptic networks. Grav-supported structures reach to the heavens. Jump 2 travel becomes possible, allowing easier travel beyond the one jump stellar mains."
  },
  "C": {
    "level": "12",
    "shortDescription": "Average Stellar",
    "technologyAge": "Weather Control",
    "details": "Weather control revolutionises terraforming and agriculture. Man-portable plasma weapons and carrier-mounted fusion guns make the battlefield untenable for unarmoured combatants. Jump 3 travel is developed. "
  },
  "D": {
    "level": "13",
    "shortDescription": "Average Stellar",
    "technologyAge": "Cloning",
    "details": "The battle dress appears on the battlefield in response to the new weapons. Cloning of body parts becomes easy. Advances in hull design and thruster plates means that spacecraft can easily go underwater. Jump 4 travel."
  },
  "E": {
    "level": "14",
    "shortDescription": "Average Stellar",
    "technologyAge": "Flying Cities",
    "details": "Fusion weapons become manportable. Flying cities appear. Jump 5 travel."
  },
  "F": {
    "level": "15",
    "shortDescription": "High Stellar",
    "technologyAge": "Black Globes",
    "details": "Black globe generators suggest a new direction for defensive technologies, while the development of synthetic anagathics means that the human lifespan is now vastly increased. Jump 6 travel."
  }
}

const atmospheres = {
  "0": {"composition": "No", gearRequired: "Vacc Suit"},
  "1": {"composition": "Trace", gearRequired: "Vacc Suit"},
  "2": {"composition": "Very Thin, Tainted", gearRequired: "Respirator & Filter"},
  "3": {"composition": "Very Thin", gearRequired: "Respirator"},
  "4": {"composition": "Thin, Tainted", gearRequired: "Filter"},
  "5": {"composition": "Thin", gearRequired: "None"},
  "6": {"composition": "Standard", gearRequired: "None"},
  "7": {"composition": "Standard, Tainted", gearRequired: "Filter"},
  "8": {"composition": "Dense", gearRequired: "None"},
  "9": {"composition": "Dense, Tainted", gearRequired: "Filter"},
  "A": {"composition": "Exotic", gearRequired: "Air Supply"},
  "B": {"composition": "Corrosive", gearRequired: "Vacc Suit"},
  "C": {"composition": "Insidious", gearRequired: "Vacc Suit"},
  "D": {"composition": "Very Dense", gearRequired: "None"},
  "E": {"composition": "Low", gearRequired: "None"},
  "F": {"composition": "Unusual", gearRequired: "Varies"}
};


class MongooseTraveller2 extends TravellerBase {
  static data = 'mgt2';
  static textName = 'mgt2';
  static title = 'Mongoose Traveller 2';
  static id = 5;
  static defaultPrefix = 'library';
  static webAbout = `
    <p>A Muse persona for the Mongoose Traveller 2 RPG.</p>
    <p>Muse can decompose a UWP. Enter <span class="command">library UWP</span> and Muse will break down the UWP.
    For example enter, <span class="command">library A832921-C</span> and Muse will reply with</p>
    <p>
      <b>A832921-C</b><br/>
      <b>Starport (A)</b><br/>
      This port is Excellent Berthing costs are 1DxCR1000 per day. This port has Refined fuel<br/> 
      <b>Size (8)</b><br/>
      12,800km in diameter<br/>
      Gravity is 1G<br/>
      <b>Atmosphere (3)</b><br/>
      Very Thin atmosphere<br/>
      This atmosphere requires Respirator <br/>
      <b>Hydrosphere (2)</b><br/>
      A few small seas<br/>
      <b>Population: (9)</b><br/>
      1,000,000,000<br/>
      <b>Government (2)</b><br/>
      Participating Democracy <br/>
      <b>Law (1)</b><br/>
      Bans:<br/>
          Poison Gas, Explosives, Undetectable Weapons and WMD;<br/>
          Battle Dress<br/>
      <b>Tech (C)</b><br/>
       TL 12<br/>
      Average Stellar<br/>
    </p>
  `;

  validateUWP([starport, size, atmosphere, hydrosphere, population, government, law, tech]) {
    return (
      starport in starPorts &&
      size in PLANET_SIZES &&
      atmosphere in atmospheres &&
      hydrosphere in HYDROSPHERES &&
      government in GOVERNMENTS &&
      law in LAW_LEVELS &&
      tech in TECH_LEVELS
    );
  }

  starportText(starport) {
    const {quality, berthingCost, fuelAvailable} = starPorts[starport];

    let response;
    if (quality === "None") {
      response = '\tThere is **no starport** on this planet\n';
    } else {
      response = `\tThis port is ${quality}\n\tBerthing costs are ${berthingCost} per day\n`;
    }

    if (fuelAvailable === "None") {
      response += '\tThis port has **No fuel**';
    } else {
      response += `\tThis port has ${fuelAvailable} fuel`;
    }

    return response;
  }

  governmentText(government) {
    return `\t${GOVERNMENTS[government]}`;
  }

  atmosphereText(atmosphere) {
    const {composition, gearRequired} = atmospheres[atmosphere];
    let response = `\t${composition} atmosphere\n\t`;
    if (gearRequired === "None") {
      response += `No special gear is required`;
    } else {
      response += `This atmosphere requires ${gearRequired}`;
    }
    return response;
  }

  lawText(law) {
    const {weaponsBanned, armourBanned} = LAW_LEVELS[law];
    return `\t*Bans*:\n\t\t${weaponsBanned};\n\t\t${armourBanned}`;
  }

  hydrosphereText(hydrosphere) {
    const {description} = HYDROSPHERES[hydrosphere];
    return `\t${description}`;
  }

  techText(tech) {
    const {level, shortDescription} = TECH_LEVELS[tech];
    return `\tTL ${level}\n\t${shortDescription}`;
  }

  populationText(population) {
    const formatter = new Intl.NumberFormat('en-US', {useGrouping: true});
    return '\t' + formatter.format(10**Number(population));
  }

  planetSizeText(size) {
    const {diameter, gravity} = PLANET_SIZES[size];
    return `\t${diameter} in diameter\n\tGravity is ${gravity}G`;
  }

}

module.exports = MongooseTraveller2;
