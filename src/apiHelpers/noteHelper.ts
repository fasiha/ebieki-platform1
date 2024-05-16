export interface PutArgs {
  user: string; // also can come from query param
  vocabKanji: string;
  note: string;
}
export const noteHelperPut = async (args: PutArgs) =>
  fetch(`/api/note/${args.vocabKanji}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });

export type GetArgs = Pick<PutArgs, "user" | "vocabKanji">;
export type GetResponse = string;
export const noteHelperGet = async (args: GetArgs) =>
  fetch(`/api/note/${args.vocabKanji}?user=${args.user}`);
