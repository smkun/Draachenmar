import { Item } from '../types';

export const items: Item[] = [
  // Legendary Weapons from Gulanbarak
  {
    "id": "earthshaker",
    "name": "Earthshaker",
    "type": "weapon",
    "rarity": "legendary",
    "description": "The legendary waraxe of High King Rathgar \"Stoneforge\" Ironhammer. Earthshaker was forged in the heart of the mightiest volcano of the old world by the first King of Gulanbarak. Legend tells that it was crafted using a fragment of a fallen star, melded with the purest of dwarven metals. It resonates with an aura of power, and when swung in battle, can make the ground tremble, giving it its name. The weapon serves as a symbol of royal authority and dwarven craftsmanship.",
    "properties": ["When swung in battle, can make the ground tremble", "Crafted from fallen star fragment and pure dwarven metals"],
    "owner": "High King Rathgar Ironhammer",
    "tags": ["item", "weapon", "legendary", "dwarf", "royal", "magic"],
    "creator": "Campaign Setting"
  },
  {
    "id": "stonebreaker",
    "name": "Stonebreaker",
    "type": "weapon",
    "rarity": "legendary",
    "description": "The ancestral warhammer carried by Prince Balthyr Ironhammer, eldest son of the dwarven royal family. Stonebreaker is a symbol of his lineage and commitment to his people. This mighty weapon has been passed down through generations of the Ironhammer family and serves as both a weapon of war and a ceremonial symbol of the prince's dedication to protecting Gulanbarak.",
    "properties": ["Ancestral weapon with family enchantments", "Symbol of royal lineage and protection"],
    "owner": "Prince Balthyr Ironhammer",
    "tags": ["item", "weapon", "legendary", "dwarf", "royal", "ancestral"],
    "creator": "Campaign Setting"
  },
  {
    "id": "luminous-amulet-of-yorandis",
    "name": "Luminous Amulet of Yorandis",
    "type": "accessory",
    "rarity": "legendary",
    "description": "A fascinating and enigmatic artifact created by the legendary archmage Yorandis. This amulet features an opalescent gem set in an ornate silver setting, making it a visually captivating object. The amulet's unique combination of blessings and curses makes it a coveted but treacherous item for those who seek its power. The risk of being consumed by despair serves as a reminder that the amulet's power is not without consequences.",
    "properties": ["Opalescent gem in ornate silver setting", "Grants powerful magical abilities but carries a curse risk"],
    "tags": ["item", "artifact", "legendary", "magic", "cursed", "amulet"],
    "creator": "Paul Moore"
  },

  // Enchanted Items
  {
    "id": "runic-robes-hilda",
    "name": "Runic Robes of Princess Hilda",
    "type": "armor",
    "rarity": "rare",
    "description": "The magical robes worn by Princess Hilda Ironhammer, chief mage of Gulanbarak. These robes are adorned with ancient dwarven runes that shimmer with protective magic. The intricate runic inscriptions provide magical protection and enhance the wearer's ability to cast dwarven runic magic. They serve as both a symbol of her royal status and her mastery of the arcane arts.",
    "properties": ["Adorned with runes that shimmer with protective magic", "Enhances dwarven runic magic abilities"],
    "owner": "Princess Hilda Ironhammer",
    "tags": ["item", "armor", "magic", "dwarf", "royal", "protective"],
    "creator": "Campaign Setting"
  },
  {
    "id": "regal-armor-rathgar",
    "name": "Regal Armor of King Rathgar",
    "type": "armor",
    "rarity": "rare",
    "description": "The magnificent royal armor worn by High King Rathgar \"Stoneforge\" Ironhammer. This armor is adorned with intricate, rune-inscribed designs that showcase the finest of dwarven craftsmanship. The armor not only provides protection in battle but also serves as a symbol of the king's authority and the rich traditions of Gulanbarak. Each rune tells a story of dwarven heritage and royal power.",
    "properties": ["Intricate rune-inscribed designs", "Symbol of royal authority and dwarven craftsmanship"],
    "owner": "High King Rathgar Ironhammer",
    "tags": ["item", "armor", "royal", "dwarf", "runic", "ceremonial"],
    "creator": "Campaign Setting"
  },

  // Magical Artifacts
  {
    "id": "enchanted-door-whispering-oaks",
    "name": "Enchanted Door of Whispering Oaks",
    "type": "artifact",
    "rarity": "rare",
    "description": "A magnificent, ancient oak tree with its trunk etched with intricate, glowing runes. At first glance, it appears to be an ordinary tree, blending seamlessly with the forest. However, this mystical portal serves as an enchanted doorway, allowing passage between distant locations or realms. The runes pulse with ancient magic, and the tree whispers secrets to those who know how to listen.",
    "properties": ["Glowing runes etched into ancient oak", "Serves as mystical portal for travel"],
    "tags": ["item", "artifact", "magic", "portal", "nature", "travel"],
    "creator": "Campaign Setting"
  },
  {
    "id": "band-of-loyalty",
    "name": "The Band of Loyalty",
    "type": "accessory",
    "rarity": "uncommon",
    "description": "A delicate silver band adorned with tiny sapphire gemstones that glisten like stars in the night sky. In the center of the band rests a larger heart-shaped sapphire, its deep blue hue symbolizing the depth of true friendship. The heart-shaped sapphire is encircled by a delicate ring of intertwined silver and gold, representing the unbreakable bond between friends.",
    "properties": ["Heart-shaped sapphire centerpiece surrounded by star-like sapphires", "Strengthens bonds of friendship"],
    "tags": ["item", "jewelry", "friendship", "magic", "sapphire", "loyalty"],
    "creator": "J Thompson"
  },

  // Notable Weapons from Campaigns
  {
    "id": "frostbane",
    "name": "Frostbane: The Sword of Eternal Winter",
    "type": "weapon",
    "rarity": "legendary",
    "description": "In the realm of Draachenmar, where winter's grip never relented, there existed a legendary sword known as Frostbane, said to possess the power to control ice and snow. Crafted by the Frostforgers, an ancient order of master blacksmiths and ice mages, Frostbane was lost to time after a great battle between the forces of light and darkness. The blade radiates an aura of eternal cold.",
    "properties": ["Controls ice and snow", "Radiates eternal cold", "Crafted by ancient Frostforgers"],
    "tags": ["item", "weapon", "legendary", "ice", "cold", "ancient"],
    "creator": "Joe Ettl"
  },
  {
    "id": "necrobane",
    "name": "Necrobane: The Ebon Enigma",
    "type": "weapon",
    "rarity": "legendary",
    "description": "Necrobane is a legendary and sentient magical sword, its dark history shrouded in mystery and foreboding. The blade itself is forged from a rare otherworldly material resembling obsidian, but it possesses the unnerving ability to absorb light, casting a dim, eerie glow. The hilt is wrapped in tattered, spectral leather, exuding an otherworldly aura. Created for a singular purpose – to purge the world of the undead.",
    "properties": ["Undead Bane: Deals devastating damage to undead creatures", "Absorbs light, casts eerie glow", "Sentient blade"],
    "tags": ["item", "weapon", "legendary", "undead", "sentient", "dark"],
    "creator": "Rich Auffrey"
  }
];