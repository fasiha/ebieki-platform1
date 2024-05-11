export interface DependencyGraph {
  metadata: Record<string, unknown>;
  kanjiToRadicals: Record<string, string[]>;
  radicalToKanjis: Record<string, string[]>;
}