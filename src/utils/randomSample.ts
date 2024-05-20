/**
 * Perform a (partial) shuffle/sample
 *
 * Equivalent to `shuffle(v).slice(0, limit)`, but faster because it
 * stops Fisher-Yates after `limit` (instead of shuffling the entire
 * list)
 *
 * Consumes the array! If you don't want to lose the original, pass in a
 * copy: `randomSampleInplace(v.slice())`
 */
export const randomSampleInplace = <T>(a: T[], limit = a.length): T[] => {
  if (limit === 0 || a.length === 0) return [];
  if (a.length === 1) return a;
  // follows the notation of
  // https://en.wikipedia.org/w/index.php?title=Fisher–Yates_shuffle&oldid=1217025931#The_modern_algorithm
  // -> "from lowest to highest"
  const n = a.length;
  const end = Math.min(n - 1, limit);
  for (let i = 0; i < end; ++i) {
    const j = Math.floor(Math.random() * (n - i) + i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  a.splice(limit, a.length);
  return a;
};

export const weightedSample = <T>(a: T[], ws: number[], n: number): T[] => {
  if (a.length === 0) return a;

  const weights = ws.slice(); // we're going to be overwriting these
  let summed = prefixSum(weights);

  const res: T[] = [];
  for (let i = 0; i < n; i++) {
    if (summed[summed.length - 1] === 0) break;

    const r = Math.random() * summed[summed.length - 1];

    // we must have `s>r` here. Consider `ws = [0 1 1]` -> `summed = [0
    // 1 2]`. `r=0` is possible. `s>r` guarantees we never pick a
    // 0-weight element.
    const idx = summed.findIndex((s) => s > r);

    if (idx < 0) throw new Error("this should never happen");
    res.push(a[idx]);
    weights[idx] = 0;
    summed = updatePrefixSum(weights, summed, idx);
  }

  return res;
};
const prefixSum = (v: number[]): number[] => {
  const res: number[] = [v[0]];
  for (let i = 1; i < v.length; ++i) res[i] = v[i] + res[i - 1];
  return res;
};
const updatePrefixSum = (
  ws: number[],
  summed: number[],
  start: number
): number[] => {
  if (start === 0) return prefixSum(ws);
  for (let i = start; i < ws.length; ++i) summed[i] = ws[i] + summed[i - 1];
  return summed;
};
