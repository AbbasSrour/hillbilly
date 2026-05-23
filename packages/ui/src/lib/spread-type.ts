/**
 * Utility type that automatically spreads all first-level object keys
 * in the provided type and returns them as one flattened object.
 * @template T The source type containing objects to spread
 */
export type SpreadType<T> = {
  [K in keyof T as T[K] extends object ? never : K]: T[K];
} & UnionToIntersection<{ [P in keyof T]: T[P] extends object ? T[P] : never }[keyof T]>;

/**
 * Helper utility type to convert a union type to an intersection type
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
