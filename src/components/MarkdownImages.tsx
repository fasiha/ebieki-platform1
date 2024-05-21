import styles from "./MarkdownImages.module.css";

import { For, Show, type Component } from "solid-js";

interface Props {
  markdown?: string;
}
export const MarkdownImages: Component<Props> = ({ markdown }) => {
  return (
    <Show when={markdownToImageUrls(markdown ?? "").length}>
      <div class={styles["container"]}>
        <For each={markdownToImageUrls(markdown ?? "")}>
          {(url) => (
            <a href={url} class={styles["item"]}>
              <img src={url} />
            </a>
          )}
        </For>
      </div>
    </Show>
  );
};

const markdownToImageUrls = (markdown: string): string[] =>
  markdown
    .split("\n")
    .filter(
      (s) =>
        s.startsWith("![") &&
        s.includes("/api/file/") &&
        s.match(/[a-zA-Z0-9-]+\)$/)
    )
    .map((s) => s.slice(s.indexOf("/api/file")).replace(")", ""));
