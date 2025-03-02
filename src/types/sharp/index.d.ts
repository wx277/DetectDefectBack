declare module 'sharp' {
  interface Sharp {
    resize(width?: number, height?: number, options?: {
      fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
    }): Sharp;
    jpeg(options?: { quality?: number }): Sharp;
    toFile(path: string): Promise<void>;
  }

  function sharp(input: string | Buffer): Sharp;
  export = sharp;
} 