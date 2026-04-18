import { afterEach, describe, expect, it } from "vitest";

import { describeTagged, tagged } from "./base";

const savedEnv = process.env.VITEST_TAGS;

afterEach(() => {
  if (savedEnv === undefined) delete process.env.VITEST_TAGS;
  else process.env.VITEST_TAGS = savedEnv;
});

describe("tagging helpers — smoke", () => {
  it("describeTagged and tagged both export callable factories", () => {
    expect(typeof describeTagged).toBe("function");
    expect(typeof tagged).toBe("function");
    const factory = tagged(["smoke"]);
    expect(typeof factory.it).toBe("function");
  });
});

// Example of an always-included tag that proves the include path runs.
describeTagged("example: always-included group", ["__scaffold_included__"], () => {
  it("runs in the default suite", () => {
    expect(1 + 1).toBe(2);
  });
});
