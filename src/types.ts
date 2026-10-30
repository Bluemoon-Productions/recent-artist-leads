export interface Artist {
  id: string;
  name: string;
  type: string;
  location: string;
  country: string;
  tags: string[];
  profileUrl: string;
  instagram: string;
  youtube: string;
  spotify: string;
}

export interface LocalAccount {
  email: string;
  salt: string;
  passwordHash: string;
}
