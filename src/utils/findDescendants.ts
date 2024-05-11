export function findDescendants(
  graph: Record<string, string[]>, // this is a DAG: must be acyclic (except you're allowed to point to yourself)
  root: string
): string[] {
  const children = (graph[root] ?? []).filter((x) => x !== root);
  return children.concat(
    children.flatMap((child) => findDescendants(graph, child))
  );
}
