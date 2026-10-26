export type Category = {
  id: string;
  label: string;
  tags: { id: string; label: string }[];
};

export type CategoryGroup = {
  id: string;
  label: string;
  categoryIds: string[];
};

export const NOTE_MAX_LENGTH = 500;

export const GROUPS: CategoryGroup[] = [
  {
    id: "home",
    label: "Zuhause & Garten",
    categoryIds: ["home", "garden", "pets"],
  },
  {
    id: "tech",
    label: "Technik & Gaming",
    categoryIds: ["tech", "gaming"],
  },
  {
    id: "style",
    label: "Mode & Pflege",
    categoryIds: ["clothing", "accessories", "beauty", "wellness"],
  },
  {
    id: "culture",
    label: "Lesen, Musik & Film",
    categoryIds: ["books", "music", "movies"],
  },
  {
    id: "leisure",
    label: "Spiel & Kreatives",
    categoryIds: ["games", "creative", "learning", "handmade"],
  },
  {
    id: "active",
    label: "Sport & Draußen",
    categoryIds: ["fitness", "outdoor"],
  },
  {
    id: "food",
    label: "Essen & Trinken",
    categoryIds: ["sweets", "delicatessen", "drinks", "cooking"],
  },
  {
    id: "experiences",
    label: "Erlebnisse & Gutscheine",
    categoryIds: ["experiences", "travel", "vouchers"],
  },
];

export const CATALOG: Category[] = [
  {
    id: "books",
    label: "Bücher",
    tags: [
      { id: "crime", label: "Krimi & Thriller" },
      { id: "fantasy", label: "Fantasy & Sci-Fi" },
      { id: "novel", label: "Romane" },
      { id: "nonfiction", label: "Sachbuch" },
      { id: "biography", label: "Biografien" },
      { id: "comics", label: "Comics & Manga" },
      { id: "audiobook", label: "Hörbücher" },
    ],
  },
  {
    id: "sweets",
    label: "Süßes",
    tags: [
      { id: "chocolate", label: "Schokolade" },
      { id: "pralines", label: "Pralinen" },
      { id: "gummies", label: "Fruchtgummi" },
      { id: "cookies", label: "Kekse & Gebäck" },
      { id: "christmas", label: "Lebkuchen & Weihnachtliches" },
    ],
  },
  {
    id: "delicatessen",
    label: "Herzhaftes & Feinkost",
    tags: [
      { id: "snacks", label: "Chips & Nüsse" },
      { id: "cheese", label: "Käse & Wurst" },
      { id: "oils", label: "Öle & Essig" },
      { id: "spices", label: "Gewürze & Saucen" },
      { id: "hampers", label: "Präsentkörbe" },
    ],
  },
  {
    id: "drinks",
    label: "Getränke",
    tags: [
      { id: "wine", label: "Wein & Sekt" },
      { id: "beer", label: "Bier & Craft Beer" },
      { id: "spirits", label: "Spirituosen" },
      { id: "tea", label: "Tee" },
      { id: "coffee", label: "Kaffee" },
      { id: "non-alcoholic", label: "Alkoholfreies" },
    ],
  },
  {
    id: "cooking",
    label: "Kochen & Backen",
    tags: [
      { id: "tools", label: "Küchenhelfer" },
      { id: "baking", label: "Backzubehör" },
      { id: "tableware", label: "Geschirr & Tassen" },
      { id: "bbq", label: "Grillen" },
      { id: "cookbooks", label: "Kochbücher" },
      { id: "storage", label: "Vorratsdosen" },
    ],
  },
  {
    id: "experiences",
    label: "Erlebnisse",
    tags: [
      { id: "concert", label: "Konzert" },
      { id: "theater", label: "Theater & Musical" },
      { id: "cinema", label: "Kino" },
      { id: "workshop", label: "Kurs & Workshop" },
      { id: "trip", label: "Ausflug" },
      { id: "dining", label: "Essen gehen" },
      { id: "escape-room", label: "Escape Room & Freizeitpark" },
    ],
  },
  {
    id: "travel",
    label: "Reisen & Unterwegs",
    tags: [
      { id: "gear", label: "Reisezubehör" },
      { id: "bags", label: "Rucksäcke & Koffer" },
      { id: "guides", label: "Reiseführer" },
      { id: "short-trip", label: "Kurztrip" },
    ],
  },
  {
    id: "tech",
    label: "Technik & Zubehör",
    tags: [
      { id: "phone", label: "Handy-Zubehör" },
      { id: "audio", label: "Kopfhörer & Lautsprecher" },
      { id: "smart-home", label: "Smart Home" },
      { id: "power", label: "Ladegeräte & Powerbanks" },
      { id: "computer", label: "Computer-Zubehör" },
      { id: "photo", label: "Fotografie" },
    ],
  },
  {
    id: "gaming",
    label: "Gaming",
    tags: [
      { id: "pc", label: "PC" },
      { id: "playstation", label: "PlayStation" },
      { id: "xbox", label: "Xbox" },
      { id: "nintendo", label: "Nintendo" },
      { id: "accessories", label: "Gaming-Zubehör" },
      { id: "credit", label: "Guthaben" },
    ],
  },
  {
    id: "games",
    label: "Gesellschaftsspiele",
    tags: [
      { id: "board", label: "Brettspiele" },
      { id: "cards", label: "Kartenspiele" },
      { id: "party", label: "Partyspiele" },
      { id: "strategy", label: "Strategiespiele" },
      { id: "puzzle", label: "Puzzle & Rätsel" },
    ],
  },
  {
    id: "clothing",
    label: "Kleidung",
    tags: [
      { id: "socks", label: "Socken" },
      { id: "sweaters", label: "Pullover & Hoodies" },
      { id: "shirts", label: "Shirts" },
      { id: "loungewear", label: "Schlafanzug & Loungewear" },
      { id: "winter", label: "Mütze, Schal & Handschuhe" },
      { id: "sportswear", label: "Sportkleidung" },
    ],
  },
  {
    id: "accessories",
    label: "Schmuck & Accessoires",
    tags: [
      { id: "necklaces", label: "Ketten & Armbänder" },
      { id: "earrings", label: "Ohrringe" },
      { id: "watches", label: "Uhren" },
      { id: "wallets", label: "Taschen & Geldbörsen" },
      { id: "sunglasses", label: "Sonnenbrillen" },
    ],
  },
  {
    id: "beauty",
    label: "Pflege & Beauty",
    tags: [
      { id: "skincare", label: "Hautpflege" },
      { id: "makeup", label: "Make-up" },
      { id: "haircare", label: "Haarpflege" },
      { id: "perfume", label: "Parfum" },
      { id: "beard", label: "Bartpflege" },
      { id: "nails", label: "Nägel" },
    ],
  },
  {
    id: "wellness",
    label: "Entspannung & Wellness",
    tags: [
      { id: "bath", label: "Badezusätze" },
      { id: "massage", label: "Massage" },
      { id: "aroma", label: "Duftöle & Duftkerzen" },
      { id: "yoga", label: "Yoga & Meditation" },
      { id: "spa", label: "Wellness-Tag" },
    ],
  },
  {
    id: "home",
    label: "Wohnen & Deko",
    tags: [
      { id: "candles", label: "Kerzen" },
      { id: "art", label: "Bilder & Poster" },
      { id: "cozy", label: "Decken & Kissen" },
      { id: "lamps", label: "Lampen & Lichterketten" },
      { id: "christmas-decor", label: "Weihnachtsdeko" },
    ],
  },
  {
    id: "garden",
    label: "Pflanzen & Garten",
    tags: [
      { id: "houseplants", label: "Zimmerpflanzen" },
      { id: "herbs", label: "Kräuter & Samen" },
      { id: "flowers", label: "Blumen" },
      { id: "tools", label: "Gartenwerkzeug" },
      { id: "balcony", label: "Balkon" },
    ],
  },
  {
    id: "fitness",
    label: "Sport & Fitness",
    tags: [
      { id: "gym", label: "Fitnessgeräte" },
      { id: "running", label: "Laufen" },
      { id: "yoga", label: "Yoga & Pilates" },
      { id: "ball", label: "Ballsport" },
      { id: "swimming", label: "Schwimmen" },
    ],
  },
  {
    id: "outdoor",
    label: "Outdoor & Natur",
    tags: [
      { id: "hiking", label: "Wandern" },
      { id: "camping", label: "Camping" },
      { id: "cycling", label: "Fahrrad" },
      { id: "fishing", label: "Angeln" },
      { id: "winter-sports", label: "Wintersport" },
    ],
  },
  {
    id: "creative",
    label: "Kreativ & Basteln",
    tags: [
      { id: "painting", label: "Malen & Zeichnen" },
      { id: "knitting", label: "Stricken & Häkeln" },
      { id: "sewing", label: "Nähen" },
      { id: "crafts", label: "Bastelsets" },
      { id: "lettering", label: "Lettering & Kalligrafie" },
    ],
  },
  {
    id: "music",
    label: "Musik",
    tags: [
      { id: "vinyl", label: "Vinyl & CDs" },
      { id: "instruments", label: "Instrumente" },
      { id: "sheet-music", label: "Noten & Zubehör" },
      { id: "merch", label: "Band-Merch" },
    ],
  },
  {
    id: "movies",
    label: "Filme & Serien",
    tags: [
      { id: "bluray", label: "DVD & Blu-ray" },
      { id: "streaming", label: "Streaming-Guthaben" },
      { id: "fan", label: "Fanartikel" },
    ],
  },
  {
    id: "learning",
    label: "Lernen & Wissen",
    tags: [
      { id: "languages", label: "Sprachen" },
      { id: "online-courses", label: "Online-Kurse" },
      { id: "experiments", label: "Experimentierkästen" },
      { id: "quiz", label: "Wissens- & Quizspiele" },
    ],
  },
  {
    id: "pets",
    label: "Fürs Haustier",
    tags: [
      { id: "dog", label: "Hund" },
      { id: "cat", label: "Katze" },
      { id: "small-pets", label: "Kleintier" },
    ],
  },
  {
    id: "vouchers",
    label: "Gutscheine",
    tags: [
      { id: "online", label: "Online-Shops" },
      { id: "bookstore", label: "Buchhandlung" },
      { id: "restaurant", label: "Restaurant" },
      { id: "drugstore", label: "Drogerie" },
      { id: "fashion", label: "Mode" },
    ],
  },
  {
    id: "handmade",
    label: "Selbstgemachtes",
    tags: [
      { id: "baked", label: "Gebackenes" },
      { id: "knitted", label: "Gestricktes" },
      { id: "preserves", label: "Eingemachtes" },
      { id: "crafted", label: "Gebasteltes" },
      { id: "time", label: "Gutschein für gemeinsame Zeit" },
    ],
  },
];

export function getCategory(categoryId: string) {
  return CATALOG.find((category) => category.id === categoryId);
}

export function getGroup(groupId: string) {
  return GROUPS.find((group) => group.id === groupId);
}
