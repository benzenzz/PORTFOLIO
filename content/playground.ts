export type PlaygroundItem = {
  title: string;
  trying: string;
  detail?: string;
  /** Số ô giữ chỗ cho ảnh chưa có. */
  placeholders?: number;
  /** Slug trong content/projects.ts. */
  projectSlug?: string;
};

export const playground = {
  title: "Playground",
  intro: "Things I am trying outside client work.",
  more: "[More experiments, Demi adds later]",
  items: [
    {
      title: "Photowalk",
      trying: "[One line, Demi to provide]",
      detail: "Sorted by colour palette",
      placeholders: 6,
    },
    {
      title: "Animated Invitations",
      trying: "[One line, Demi to provide]",
      projectSlug: "animated-invitations",
    },
  ] satisfies PlaygroundItem[],
};
