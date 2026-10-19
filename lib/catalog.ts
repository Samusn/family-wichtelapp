export type Category = {
  id: string;
  label: string;
  tags: { id: string; label: string }[];
};

export const NOTE_MAX_LENGTH = 500;

export const CATALOG: Category[] = [
  {
    id: "books",
    label: "Bücher",
    tags: [
      { id: "crime", label: "Krimi & Thriller" },
      { id: "fantasy", label: "Fantasy & Sci-Fi" },
      { id: "novel", label: "Romane" },
      { id: "nonfiction", label: "Sachbuch" },
      { id: "comics", label: "Comics & Manga" },
      { id: "cookbook", label: "Kochbücher" },
    ],
  },
  {
    id: "sweets",
    label: "Süßes & Snacks",
    tags: [
      { id: "chocolate", label: "Schokolade" },
      { id: "gummies", label: "Fruchtgummi" },
      { id: "savory", label: "Herzhaftes" },
      { id: "tea-coffee", label: "Tee & Kaffee" },
    ],
  },
  {
    id: "experiences",
    label: "Erlebnisse",
    tags: [
      { id: "concert", label: "Konzert & Theater" },
      { id: "cinema", label: "Kino" },
      { id: "workshop", label: "Kurs & Workshop" },
      { id: "trip", label: "Ausflug" },
      { id: "dining", label: "Essen gehen" },
    ],
  },
  {
    id: "tech",
    label: "Technik & Gadgets",
    tags: [
      { id: "accessories", label: "Zubehör" },
      { id: "audio", label: "Audio" },
      { id: "smart-home", label: "Smart Home" },
      { id: "gaming-hardware", label: "Gaming" },
    ],
  },
  {
    id: "games",
    label: "Spiele",
    tags: [
      { id: "board", label: "Brettspiele" },
      { id: "cards", label: "Kartenspiele" },
      { id: "puzzle", label: "Puzzle" },
      { id: "video", label: "Videospiele" },
    ],
  },
  {
    id: "clothing",
    label: "Kleidung & Accessoires",
    tags: [
      { id: "socks", label: "Socken" },
      { id: "winter", label: "Mütze & Schal" },
      { id: "jewelry", label: "Schmuck" },
      { id: "bags", label: "Taschen" },
    ],
  },
  {
    id: "wellness",
    label: "Wellness & Pflege",
    tags: [
      { id: "cosmetics", label: "Kosmetik" },
      { id: "fragrance", label: "Duft" },
      { id: "bath", label: "Bad & Dusche" },
      { id: "relax", label: "Entspannung" },
    ],
  },
  {
    id: "kitchen",
    label: "Küche & Genuss",
    tags: [
      { id: "spices", label: "Gewürze" },
      { id: "tools", label: "Küchenhelfer" },
      { id: "wine", label: "Wein & Spirituosen" },
      { id: "delicatessen", label: "Feinkost" },
    ],
  },
  {
    id: "home",
    label: "Zuhause & Deko",
    tags: [
      { id: "candles", label: "Kerzen" },
      { id: "plants", label: "Pflanzen" },
      { id: "art", label: "Bilder & Poster" },
      { id: "cozy", label: "Kuscheliges" },
    ],
  },
  {
    id: "sports",
    label: "Sport & Outdoor",
    tags: [
      { id: "fitness", label: "Fitness" },
      { id: "hiking", label: "Wandern" },
      { id: "cycling", label: "Fahrrad" },
      { id: "camping", label: "Camping" },
    ],
  },
  {
    id: "creative",
    label: "Kreativ & Basteln",
    tags: [
      { id: "painting", label: "Malen & Zeichnen" },
      { id: "needlework", label: "Handarbeit" },
      { id: "crafts", label: "Basteln" },
      { id: "photo", label: "Fotografie" },
    ],
  },
  {
    id: "media",
    label: "Musik & Filme",
    tags: [
      { id: "vinyl", label: "Vinyl & CDs" },
      { id: "movies", label: "Filme & Serien" },
      { id: "instruments", label: "Instrumente" },
    ],
  },
  {
    id: "handmade",
    label: "Selbstgemachtes",
    tags: [
      { id: "baked", label: "Gebackenes" },
      { id: "knitted", label: "Gestricktes" },
      { id: "time", label: "Gutschein für Zeit" },
    ],
  },
];

export function getCategory(categoryId: string) {
  return CATALOG.find((category) => category.id === categoryId);
}
