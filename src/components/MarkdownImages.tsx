import "./MarkdownImages.css";

import { For, type Component } from "solid-js";

interface Props {
  markdown?: string;
}
export const MarkdownImages: Component<Props> = ({ markdown }) => {
  return (
    <div class="container">
      <For each={markdownToImageUrls(markdown ?? "")}>
        {(url) => (
          <a href={url} class="item">
            <img src={url} />
          </a>
        )}
      </For>
    </div>
  );
};

const markdownToImageUrls = (markdown: string): string[] => {
  const x = markdown
    .split("\n")
    .filter(
      (s) =>
        s.startsWith("![") &&
        s.includes("/api/file/") &&
        s.match(/[a-zA-Z0-9-]+\)$/)
    )
    .map((s) => s.slice(s.indexOf("/api/file")).replace(")", ""));
  return [1, 2, 3].flatMap((_) => x);
};
