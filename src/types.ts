export type ReleaseStatus = "Announced" | "Upcoming" | "Released";
export type ReleaseType = "Single" | "Album" | "EP" | "Music video";

export interface Artist {
  id: string;
  name: string;
  community: string;
  niche: string;
  area: string;
  state: string;
  followers: number;
  releaseTitle: string;
  releaseType: ReleaseType;
  releaseStatus: ReleaseStatus;
  releaseDate: string;
  instagram: string;
  youtube: string;
  spotify: string;
  source: string;
  mobile: string;
  email: string;
  management: string;
  isDemo?: boolean;
}

export interface LocalAccount {
  email: string;
  salt: string;
  passwordHash: string;
}
