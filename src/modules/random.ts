import RandomOrg from "random-org";
export class FakeRandom {
  int(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  choice<T>(options: ArrayLike<T>): T {
    if (!Array.isArray(options)) return options as T;
    if (options.length == 1) return options[0];
    const res = this.int(0, options.length - 1);
    return options[res];
  }
  ints(min: number, max: number, count: number) {
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
      result.push(this.int(min, max));
    }
    return result;
  }
}
export class Random {
  api;
  constructor(apiKey: string) {
    this.api = new RandomOrg({ apiKey });
  }
  async int(min: number, max: number) {
    if (max == min) return min;
    if (min > max) {
      [max, min] = [min, max];
    }
    const result = await this.api.generateIntegers({
      min: min,
      max: max,
      n: 1,
    });
    return result.random.data[0];
  }
  async choice<T>(options: ArrayLike<T>): Promise<T> {
    if (!Array.isArray(options)) return options as T;
    if (options.length == 1) return options[0];
    const res = await this.int(0, options.length - 1);
    return options[res];
  }
  async ints(min: number, max: number, count: number) {
    if (max == min) return Array(count).fill(min);
    if (min > max) {
      [max, min] = [min, max];
    }
    const result = await this.api.generateIntegers({
      min: min,
      max: max,
      n: count,
    });
    const data: number[] = result.random.data;
    return data;
  }
}
