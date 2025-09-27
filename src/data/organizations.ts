import { Organization } from '../types';

export const organizations: Organization[] = [
  // Pantheons and Religious Orders
  {
    "id": "court-of-seasons",
    "name": "The Court of Seasons",
    "type": "pantheon",
    "description": "The Court of Seasons is a divine assembly of four deities, each representing one of the four seasons: Spring, Summer, Autumn, and Winter. These deities are revered for their roles in the natural world and the profound influence they have on the lives of mortals throughout the year. The Court serves as a reflection of the cyclical nature of life and the interconnectedness of the natural world with the divine.",
    "members": ["Verdantia", "Aestus", "Foliara", "Hibernus"],
    "goals": [
      "Guide mortals through the ever-changing seasons",
      "Maintain the natural balance of the world",
      "Teach acceptance of life's cyclical nature"
    ],
    "tags": ["pantheon", "seasons", "nature", "divine", "festivals"]
  },
  {
    "id": "ennead-of-eternity",
    "name": "The Ennead of Eternity",
    "type": "pantheon",
    "description": "A divine pantheon of nine gods representing all alignments of the cosmic order. Each deity embodies a specific moral and ethical alignment, from the chaotic freedom of Aelthorin to the tyrannical control of Zarithak. Together, they represent the full spectrum of divine influence and moral choice available to mortals.",
    "members": ["Aelthorin", "Lirix", "Xyrrul", "Veridia", "Ora'kai", "Nekrulon", "Solanar", "Thaldir", "Zarithak"],
    "goals": [
      "Maintain cosmic balance across all alignments",
      "Provide divine guidance for every moral path",
      "Oversee the eternal struggle between order and chaos"
    ],
    "tags": ["pantheon", "alignment", "cosmic", "divine", "eternity", "balance"]
  },
  {
    "id": "primordial-concordant",
    "name": "The Primordial Concordant",
    "type": "pantheon",
    "description": "In the mystical lore of the jungle island of Uxmal, the Primordial Concordant stands as a sacred assembly of four venerable deities, each a master of their elemental domain. These foundational pillars of the island's mythology wield the power of Earth, Water, Air, and Fire, shaping the very essence of Uxmal and guiding its inhabitants through the ebb and flow of existence.",
    "headquarters": "Uxmal Island",
    "members": ["Aqumaris", "Zephyron", "Terraqua", "Draconis Ignis"],
    "goals": [
      "Maintain elemental balance on Uxmal",
      "Protect the island's natural forces",
      "Guide the diverse inhabitants in harmony with nature"
    ],
    "tags": ["pantheon", "elemental", "uxmal", "nature", "harmony", "island"]
  },
  {
    "id": "astral-triad",
    "name": "The Astral Triad",
    "type": "pantheon",
    "description": "The Astral Triad is a divine assembly of three deities, each embodying celestial and cosmic aspects of the universe. They are revered for their influence over the skies, celestial bodies, and the mysteries of the cosmos. Worshipers turn to them for guidance, inspiration, and protection, finding solace in the grandeur of the celestial realm.",
    "members": ["Astraia", "Solanus", "Nyxia"],
    "goals": [
      "Guide mortals through celestial wisdom",
      "Oversee the cosmic order and celestial events",
      "Provide inspiration through the beauty of the cosmos"
    ],
    "tags": ["pantheon", "celestial", "stars", "cosmic", "divine", "astral"]
  },

  // Legitimate Organizations
  {
    "id": "gray-order",
    "name": "The Gray Order",
    "type": "order",
    "description": "The Gray Order is a clandestine and enigmatic organization dedicated to the exploration and rediscovery of the ancient and long-forgotten realm of Bargothia. This once-great civilization, known for its advanced magical knowledge and enigmatic artifacts, fell when a fragment of the Centennial comet 'the Emissary' crashed into Bargothia, causing the great wound. The Gray Order seeks to unveil its mysteries, harness its forgotten power, and ensure that its legacy is not lost to time.",
    "leader": "High Priestess Lirael Starwhisper",
    "goals": [
      "Explore the hidden corners of Bargothia",
      "Uncover lost history and knowledge",
      "Reclaim ancient magical artifacts",
      "Study Bargothia's religious practices and rituals"
    ],
    "tags": ["organization", "exploration", "archaeology", "magic", "bargothia", "knowledge"]
  },
  {
    "id": "conclave-of-arcane-sovereigns",
    "name": "Conclave of Arcane Sovereigns",
    "type": "government",
    "description": "The ruling magical council of Henge, the Spellbound Sanctuary. This prestigious organization oversees the eight Universities of Magic and governs the magical city. The Conclave ensures the advancement of magical knowledge while maintaining order among the various schools of magic.",
    "headquarters": "Henge",
    "goals": [
      "Govern the magical city of Henge",
      "Oversee the eight Universities of Magic",
      "Advance magical knowledge and research",
      "Maintain balance between magical schools"
    ],
    "tags": ["organization", "magic", "government", "henge", "education", "arcane"]
  }
];
