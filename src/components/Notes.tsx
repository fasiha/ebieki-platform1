import { Show, createEffect, createSignal, type Component } from "solid-js";
import { setNetworkError, user } from "./signals";
import {
  noteHelperGet,
  noteHelperPut,
  type GetResponse,
} from "../apiHelpers/noteHelper";

interface Props {
  vocabKanji: string;
}

/*
- not fetched
- 404 (no note)
- 200 (a note)
*/
export const Notes: Component<Props> = ({ vocabKanji }) => {
  const [editing, setEditing] = createSignal(false);
  const [markdown, setMarkdown] = createSignal<string | undefined>();
  createEffect(async () => {
    if (!user()) return;
    const res = await noteHelperGet({ user: user(), vocabKanji });
    if (!res.ok && res.status !== 404) {
      // 404 is ok, there's just no note
      setNetworkError(`Unable to get note: ${res.status} ${res.statusText}`);
      return;
    }
    const gotNote: GetResponse = res.ok ? await res.text() : "";
    setMarkdown(gotNote);
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault(); // don't refresh the page
    if (!user() && editing()) return;
    const res = await noteHelperPut({
      user: user(),
      vocabKanji,
      note: markdown() ?? "",
    });
    if (!res.ok) {
      setNetworkError(`Unable to submit note: ${res.status} ${res.statusText}`);
      return;
    }
    setEditing(false);
  };

  const handleEdit = (
    e: Event & {
      currentTarget: HTMLTextAreaElement;
      target: HTMLTextAreaElement;
    }
  ) => {
    setMarkdown(e.target.value);
  };
  const handleReset = (
    e: Event & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) => {
    e.preventDefault();
    setEditing(false);
  };

  return (
    <Show
      when={editing() === false}
      fallback={
        <form onSubmit={handleSubmit} onReset={(e) => handleReset(e)}>
          <textarea onChange={handleEdit}>{markdown() || ""}</textarea>
          <br />
          <button type="submit">Submit</button>
          <button type="reset">Cancel</button>
        </form>
      }
    >
      <Show
        when={markdown()}
        fallback={<button onClick={() => setEditing(true)}>Add Note</button>}
      >
        <>
          <p>
            <code>{markdown()}</code>
          </p>
          <button onClick={() => setEditing(true)}>Edit</button>
        </>
      </Show>
    </Show>
  );
};
