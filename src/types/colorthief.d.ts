declare module "colorthief" {
  export default class ColorThief {
    getColor(img: HTMLImageElement | ImageData): [number, number, number];
    getPalette(
      img: HTMLImageElement | ImageData,
      colorCount?: number
    ): Array<[number, number, number]>;
  }
}
