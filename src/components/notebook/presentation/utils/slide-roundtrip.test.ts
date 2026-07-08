import { describe, expect, it } from "vitest";
import { parseSlideXml } from "./parser";
import { serializeSlidesToXml } from "./slide-serializer";

// Fixture built from the XML grammar the model is instructed to emit
// (see src/lib/presentation/generation-prompt.ts). Covers the common node
// shapes: section layouts, headings, paragraphs, bulleted lists, multi-column
// layout, and a root image. Not exhaustive — a characterization anchor.
const FIXTURE_XML = `<PRESENTATION>
<SECTION layout="left">
<H1>Renewable Energy</H1>
<P>Powering a cleaner future for cities worldwide.</P>
<IMG query="solar panels roof" />
</SECTION>
<SECTION layout="vertical">
<H2>Key Benefits</H2>
<BULLETS>
<LI>Lower long-term energy costs</LI>
<LI>Reduced carbon emissions</LI>
<LI>Energy independence</LI>
</BULLETS>
</SECTION>
<SECTION layout="right">
<H3>Solar vs Wind</H3>
<COLUMNS>
<DIV><H4>Solar</H4><P>Best for sunny, open rooftops.</P></DIV>
<DIV><H4>Wind</H4><P>Best for exposed, breezy sites.</P></DIV>
</COLUMNS>
</SECTION>
</PRESENTATION>`;

describe("slide XML round-trip", () => {
  const slides = parseSlideXml(FIXTURE_XML);

  it("parses the fixture into the expected slides", () => {
    // Characterization: one <SECTION> => one slide.
    expect(slides.length).toBe(3);
    for (const slide of slides) {
      expect(slide.id).toBeTruthy();
      expect(slide.content.length).toBeGreaterThan(0);
    }
    // Layout attribute survives parsing.
    expect(slides.map((s) => s.layoutType)).toEqual(["left", "vertical", "right"]);
    // Root image on the first slide is captured.
    expect(slides[0]?.rootImage?.query).toBe("solar panels roof");
  });

  it("is idempotent under serialize -> parse", () => {
    // parser ids are deterministic, so a faithful serializer must yield an
    // XML string that re-parses to structurally identical slides.
    const reparsed = parseSlideXml(serializeSlidesToXml(slides));
    expect(reparsed).toEqual(slides);
  });

  it("stays stable across a second round-trip", () => {
    const once = serializeSlidesToXml(slides);
    const twice = serializeSlidesToXml(parseSlideXml(once));
    expect(twice).toBe(once);
  });
});
