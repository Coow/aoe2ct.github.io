export type DraftAction = {
  action: "ban" | "pick" | "snipe" | "steal";
  map: string;
  type: "admin" | "player";
};
export type Draft = {
  bracket: string;
  draft: DraftAction[];
  draftId: string;
  stage: string;
};
export type Drafts = { civDrafts: Draft[]; mapDrafts: Draft[] };
export type DraftCounts = {
  pick: number;
  ban: number;
  snipe: { player: number; admin: number };
  steal: number;
};
export type AllCounts = { admin: DraftCounts; player: DraftCounts };
export type Counts = [string, AllCounts];

export type Game = {
  bracket: string;
  stage: string;
  week: number;
  mapDraftId: string;
  civDraftId: string;
  players: [string, string];
  map: string;
  winningCiv: string;
  losingCiv: string;
  duration: number;
  eapm: [number, number];
  feudal_time: [number, number];
  castle_time: [number, number];
  imperial_time: [number, number];
  vil_count: [number, number];
  most_created: [string, string];
  most_created_count: [number, number];
};

export type Player = {
  set_id: string;
  bracket: string;
  duration: number;
  str_duration: string;
  map: string;
  map_draft: string;
  map_picks: string[];
  map_bans: string[];
  map_snipes: string[];
  civ_draft: string;
  civ_picks: string[];
  civ_bans: string[];
  civ_snipes: string[];
  civ_steals: string[];
  winner: boolean;
  player: string;
  opponent: string;
  civ: string;
  opponent_civ: string;
  eapm: number;
  feudal_time: string | null;
  castle_time: string | null;
  imperial_time: string | null;
  vil_count: number;
  most_created: string;
  most_created_count: number;
};

export const allCivs = [
  "Britons",
  "Byzantines",
  "Celts",
  "Chinese",
  "Franks",
  "Goths",
  "Japanese",
  "Mongols",
  "Persians",
  "Saracens",
  "Teutons",
  "Turks",
  "Vikings",
  "Aztecs",
  "Huns",
  "Koreans",
  "Maya",
  "Spanish",
  "Italians",
  "Inca",
  "Magyars",
  "Slavs",
  "Berbers",
  "Ethiopians",
  "Malians",
  "Portuguese",
  "Burmese",
  "Khmer",
  "Malay",
  "Vietnamese",
  "Bulgarians",
  "Cumans",
  "Lithuanians",
  "Tatars",
  "Burgundians",
  "Sicilians",
  "Bohemians",
  "Poles",
  "Bengalis",
  "Dravidians",
  "Gurjaras",
  "Hindustanis",
  "Romans",
  "Armenians",
  "Georgians",
  "Khitans",
  "Jurchens",
  "Shu",
  "Wei",
  "Wu",
  "Muisca",
  "Mapuche",
  "Tupi",
] as const;
