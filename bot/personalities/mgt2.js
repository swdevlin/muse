"use strict"
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const TravellerBase = require("./travellerbase");

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
    "description": "Ruling functions are reached by the advice and consent of the citizenry directly",
    "examples": "Collective, tribal council, comm-linked consensus",
    "contraband": "Drugs",
  },
  "3": {
    "type": "Self-Perpetuating Oligarchy",
    "description": "Ruling functions are performed by a restricted minority, with little or no input from the mass of citizenry",
    "examples": "Plutocracy, hereditary ruling caste",
    "contraband": "Technology, Weapons, Travellers",
  },
  "4": {
    "type": "Representative Democracy",
    "description": "Ruling functions are performed by elected representatives",
    "examples": "Republic, Democracy",
    "contraband": "Drugs, Weapons, Psionics",
  },
  "5": {
    "type": "Feudal Technocracy",
    "description": "Ruling functions are performed by specific individuals for persons who agree to be ruled by them. Relationships are based on the performance of technical activities which are mutually beneficial",
    "examples": "Those with access to higher technology tend to have higher social status",
    "contraband": "Technology, Weapons, Computers",
  },
  "6": {
    "type": "Captive Government",
    "description": "Ruling functions are performed by an imposed leadership answerable to an outside group",
    "examples": "A colony or conquered area",
    "contraband": "Weapons, Technology, Travellers",
  },
  "7": {
    "type": "Balkinisation",
    "description": "No central authority exists; rival governments complete for control. Law level refers to the government nearest the starport",
    "examples": "Multiple governments, civil wars",
    "contraband": "Varies",
  },
  "8": {
    "type": "Civil Service Bureaucracy",
    "description": "Ruling functions are performed by government agencies employing individuals selected for their expertise",
    "examples": "Technocracy, Communism",
    "contraband": "Drugs, Weapons",
  },
  "9": {
    "type": "Impersonal Bureaucracy",
    "description": "Ruling functions are performed by agencies which have become insulated from the governed citizens",
    "examples": "Entrenched castes of bureaucrats, decaying empire",
    "contraband": "Technology, Weapons, Drugs, Travellers, Psionics",
  },
  "A": {
    "type": "Charismatic Dictator",
    "description": "Ruling functions are performed by agencies directed by a single leader who enjoys the overwhelming confidence of the citizens",
    "examples": "Revolutionary leader, messiah, emperor",
    "contraband": "None",
  },
  "B": {
    "type": "Non-Charismatic Leader",
    "description": "A previous charismatic dictator has been replaced by a leader through normal channels",
    "examples": "Military dictatorship, hereditary kingship",
    "contraband": "Weapons, Technology, Computers",
  },
  "C": {
    "type": "Charismatic Oligarchy",
    "description": "Ruling functions are performed by a select group of members of an organisation or class which enjoys the overwhelming confidence of the citizenry",
    "examples": "Junta, revolutionary council",
    "contraband": "Weapons",
  },
  "D": {
    "type": "Religious Dictatorship",
    "description": "Ruling functions are performed by a religious organisation without regard to the specific individual needs of the citizenry",
    "examples": "Cult, transcendent philosophy, psionic group mind",
    "contraband": "Varies",
  },
  "E": {
    "type": "Religious Autocracy",
    "description": "Government by a single religious leader having absolute power over the citizenry",
    "examples": "Messiah",
    "contraband": "Varies",
  },
  "F": {
    "type": "Totalitarian Oligarchy",
    "description": "Government by an all-powerful minority which maintains absolute control through widespread coercion and oppresion",
    "examples": "World church, Ruthless organizations",
    "contraband": "Varies",
  }
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
    "description": "Large oceans"
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
    "description": "No Law",
    "weaponsBanned": "None",
    "armourBanned": "None"
  },
  "1": {
    "description": "Low Law",
    "weaponsBanned": "Poison Gas, Explosives, Undetectable Weapons and WMD",
    "armourBanned": "Battle Dress"
  },
  "2": {
    "description": "Low Law",
    "weaponsBanned": "Portable energy, Laser, Poison Gas, Explosives, Undetectable Weapons and WMD",
    "armourBanned": "Combat Armour, Battle Dress"
  },
  "3": {
    "description": "Low Law",
    "weaponsBanned": "Military, Portable energy, Laser, Poison Gas, Explosives, Undetectable Weapons and WMD",
    "armourBanned": "Flak, Combat Armour, Battle Dress"
  },
  "4": {
    "description": "Moderate Law",
    "weaponsBanned": "Submachine guns, light assault, Military, Portable energy, Laser, Poison Gas, Explosives, Undetectable Weapons and WMD",
    "armourBanned": "Cloth, Flak, Combat Armour, Battle Dress"
  },
  "5": {
    "description": "Moderate Law",
    "weaponsBanned": "Personal Concealable Weapons, Submachine guns, light assault, Military, Portable energy, Laser, Poison Gas, Explosives, Undetectable Weapons and WMD",
    "armourBanned": "Mesh, Cloth, Flak, Combat Armour, Battle Dress"
  },
  "6": {
    "description": "Moderate Law",
    "weaponsBanned": "All Firearms, except shotguns and stunners",
    "armourBanned": "Cloth, Flak, Combat Armour, Battle Dress"
  },
  "7": {
    "description": "Moderate Law",
    "weaponsBanned": "All Firearms, including Shotguns",
    "armourBanned": "Cloth, Flak, Combat Armour, Battle Dress"
  },
  "8": {
    "description": "High Law",
    "weaponsBanned": "All bladed weapons, stunners and all firearms",
    "armourBanned": "All visible"
  },
  "9": {
    "description": "High Law",
    "weaponsBanned": "All Weapons",
    "armourBanned": "All Armour"
  },
  "A": {
    "description": "Extreme Law",
    "weaponsBanned": "All Weapons",
    "armourBanned": "All Armour"
  },
  "B": {
    "description": "Continental passports required",
    "weaponsBanned": "All Weapons",
    "armourBanned": "All Armour"
  },
  "C": {
    "description": "Unrestricted invasion of privacy",
    "weaponsBanned": "All Weapons",
    "armourBanned": "All Armour"
  },
  "D": {
    "description": "Paramilitary law enforcement",
    "weaponsBanned": "All Weapons",
    "armourBanned": "All Armour"
  },
  "E": {
    "description": "Full-fledged police state",
    "weaponsBanned": "All Weapons",
    "armourBanned": "All Armour"
  },
  "F": {
    "description": "Daily life rigidly controlled",
    "weaponsBanned": "All Weapons",
    "armourBanned": "All Armour"
  },
  "G": {
    "description": "Disproportionate punishments",
    "weaponsBanned": "All Weapons",
    "armourBanned": "All Armour"
  },
  "H": {
    "description": "Leagalized oppressive practices",
    "weaponsBanned": "All Weapons",
    "armourBanned": "All Armour"
  },
  "J": {
    "description": "Routinely oppressive and restrictive",
    "weaponsBanned": "All Weapons",
    "armourBanned": "All Armour"
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
    "gravity": "1.125"
  },
  "A": {
    "diameter": "16,000km",
    "gravity": "1.25"
  },
  "B": {
    "diameter": "17,600km",
    "gravity": "1.375"
  },
  "C": {
    "diameter": "19,200km",
    "gravity": "1.5"
  },
  "D": {
    "diameter": "20,800km",
    "gravity": "1.625"
  },
  "E": {
    "diameter": "22,400km",
    "gravity": "1.75"
  },
  "F": {
    "diameter": "24,000km",
    "gravity": "1.875"
  },
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
    const gov = GOVERNMENTS[government].type;
    return `\t${gov}`;
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

  lawText(law, forSytem) {
    if (!forSytem)
      return super.lawText(law, forSytem);
    else {
      const {description, weaponsBanned, armourBanned} = LAW_LEVELS[law];
      return `${description}\nBans: ${weaponsBanned}; ${armourBanned}`;
    }
  }

  hydrosphereText(hydrosphere) {
    const {description} = HYDROSPHERES[hydrosphere];
    return `\t${description}`;
  }

  techText(tech) {
    const {level, shortDescription} = TECH_LEVELS[tech];
    return `\tTL ${level}\n\t${shortDescription}`;
  }

  planetSizeText(size) {
    const {diameter, gravity} = PLANET_SIZES[size];
    return `\t${diameter} in diameter\n\tGravity is ${gravity}G`;
  }

  determineTradeCodes = ([starport, size, atmosphere, hydrosphere, population, government, law, tech]) => {
    const tradeCodes = [];
    if (atmosphere >= '4' && atmosphere <= '9')
      if (hydrosphere >= '4' && hydrosphere <= '8')
        if (population >= '5' && population <= 7)
          tradeCodes.push('Ag');

    if (size === '0' && atmosphere === '0' && hydrosphere === '0')
      tradeCodes.push('As');

    if (population === '0' && government === '0' && law === '0')
      tradeCodes.push('Ba');

    if (atmosphere >= '2' && atmosphere <= '9' && hydrosphere === '0')
      tradeCodes.push('De');

    if (atmosphere >= 'A' && hydrosphere >= '1')
      tradeCodes.push('Fl');

    if (size >= '6' && size <= '8')
      if (atmosphere === '5' || atmosphere === '6' || atmosphere === '8')
        if (hydrosphere >= '5' && hydrosphere <= '7')
          tradeCodes.push('Ga');

    if (population >= '9')
      tradeCodes.push('Hi')

    if (tech >= 'C')
      tradeCodes.push('Ht')

    if (atmosphere <= '1' && hydrosphere >= '1')
      tradeCodes.push('Ic')

    if (atmosphere <= '2' || atmosphere === '4' || atmosphere === '7' || atmosphere === '9')
      if (population >= '9')
        tradeCodes.push('In')

    if (population >= '1' && population <= '3')
      tradeCodes.push('Lo')

    if (tech <= '5')
      tradeCodes.push('Lt')

    if (atmosphere >= '0' && atmosphere <= '3')
      if (hydrosphere >= '0' && hydrosphere <= '3')
        if (population >= '6')
          tradeCodes.push('Na')

    if (population >= '0' && population <= '6')
      tradeCodes.push('Ni')

    if (atmosphere >= '2' && atmosphere <= '5')
      if (hydrosphere >= '0' && hydrosphere <= '3')
        tradeCodes.push('Po')

    if (atmosphere === '6' || atmosphere === '8')
      if (population >= '6' && population <= '8')
        if (government >= '4' && government <= '9')
          tradeCodes.push('Ri')

    if (atmosphere === '0')
      tradeCodes.push('Va')

    if (hydrosphere >= 'A')
      tradeCodes.push('Wa')
    return tradeCodes;
  }

}

module.exports = MongooseTraveller2;
