export interface AsanaUser {
    gid: string;
    email: string;
    name: string;
    photo?: {
      image_21x21?: string;
      image_27x27?: string;
      image_36x36?: string;
      image_60x60?: string;
      image_128x128?: string;
    };
    workspaces?: Array<{
      gid: string;
      name: string;
    }>;
  }
  