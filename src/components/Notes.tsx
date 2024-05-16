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
  const [originalMarkdown, setOriginalMarkdown] = createSignal<
    string | undefined
  >();
  const [markdown, setMarkdown] = createSignal<string | undefined>();
  let textareaRef!: HTMLTextAreaElement;

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
    setOriginalMarkdown(gotNote);
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault(); // don't refresh the page
    if (!user() && editing()) return;
    const note = markdown() ?? "";
    const res = await noteHelperPut({
      user: user(),
      vocabKanji,
      note,
    });
    if (!res.ok) {
      setNetworkError(`Unable to submit note: ${res.status} ${res.statusText}`);
      return;
    }
    setEditing(false);
    setOriginalMarkdown(note);
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
    setMarkdown(originalMarkdown());
    setEditing(false);
  };

  const onPaste = async (
    e: ClipboardEvent & { currentTarget: HTMLFormElement }
  ) => {
    const clipboardItems = e.clipboardData?.items;
    const item = clipboardItems?.[0];
    if (!item) return;
    // TODO handle video? audio?
    if (item?.type.indexOf("image") === 0) {
      const file = item.getAsFile();
      if (!file) return;

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = async () => {
        const arrayBuffer = reader.result;
        if (!arrayBuffer) return;
        const blob = new Blob([arrayBuffer], { type: item.type });
        const response = await fetch("/api/file", {
          method: "PUT",
          headers: { "Content-Type": item.type },
          body: blob,
        });
        if (!response.ok) {
          setNetworkError(
            `Unable to upload media: ${(response.status, response.statusText)}`
          );
          return;
        }
        const { uuid } = await response.json();
        const idx = textareaRef?.selectionStart;
        if (typeof idx === "number" && idx < (markdown()?.length ?? 0)) {
          setMarkdown((old) => {
            const pre = (old ?? "").slice(0, idx);
            const post = (old ?? "").slice(idx);
            return `${pre}\n\n![${uuid}](/api/file/${uuid})\n\n${post}`;
          });
        } else {
          setMarkdown((old) => `${old}\n\n![${uuid}](/api/file/${uuid})`);
        }
      };
    }
  };

  return (
    <Show
      when={editing() === false}
      fallback={
        <form onPaste={onPaste} onSubmit={handleSubmit} onReset={handleReset}>
          <textarea ref={textareaRef} onChange={handleEdit}>
            {markdown() || ""}
          </textarea>
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
