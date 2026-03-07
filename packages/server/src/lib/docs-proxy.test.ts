import { describe, expect, test } from "bun:test";

import { createDocsProxyResponse, getDocsProxyUrl } from "./docs-proxy";

describe("getDocsProxyUrl", () => {
  test("returns null for non-docs routes", () => {
    expect(getDocsProxyUrl("http://localhost:3000/")).toBeNull();
  });

  test("rebuilds the docs upstream with https and no local port", () => {
    expect(getDocsProxyUrl("http://localhost:3000/docs?tab=api")?.toString()).toBe(
      "https://vibeinsights.mintlify.dev/docs?tab=api",
    );
  });

  test("preserves nested docs paths", () => {
    expect(getDocsProxyUrl("http://localhost:3000/docs/introduction/overview")?.toString()).toBe(
      "https://vibeinsights.mintlify.dev/docs/introduction/overview",
    );
  });
});

describe("createDocsProxyResponse", () => {
  test("strips compression headers that can become stale after proxying", () => {
    const response = createDocsProxyResponse(
      new Response("<!doctype html>", {
        headers: {
          "content-encoding": "br",
          "content-length": "123",
          "content-type": "text/html; charset=utf-8",
          "transfer-encoding": "chunked",
        },
      }),
    );

    expect(response.headers.get("content-encoding")).toBeNull();
    expect(response.headers.get("content-length")).toBeNull();
    expect(response.headers.get("transfer-encoding")).toBeNull();
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
  });
});
