import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { blocks, SectionText } from "@/components/hub/SectionText";

describe("SectionText Markdown subset", () => {
  it("splits paragraphs and lists, dropping author notes", () => {
    const b = blocks("<!-- WRITE: x -->\nOne\nline.\n\n- a\n- b\n\n1. first\n2. second\n\nEnd.");
    expect(b).toEqual([
      { kind: "p", text: "One line." },
      { kind: "ul", items: ["a", "b"] },
      { kind: "ol", items: ["first", "second"] },
      { kind: "p", text: "End." },
    ]);
  });

  it("renders bold, italic and safe links only", () => {
    const html = renderToStaticMarkup(
      SectionText({ markdown: "**Bold** and *soft* [in](/abc) [out](https://example.org) [bad](javascript:alert(1)) <b>raw</b>", pending: false }),
    );
    expect(html).toContain("<strong");
    expect(html).toContain("<em>soft</em>");
    expect(html).toContain('href="/abc"');
    expect(html).toContain('href="https://example.org"');
    expect(html).not.toContain("javascript:");
    expect(html).toContain("&lt;b&gt;raw&lt;/b&gt;");
  });
});
