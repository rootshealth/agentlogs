import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { handleDocsProxy } from "./lib/docs-proxy";

export default createServerEntry({
  async fetch(request: Request) {
    // Proxy /docs to Mintlify
    const docsResponse = await handleDocsProxy(request);
    if (docsResponse) {
      return docsResponse;
    }

    return handler.fetch(request);
  },
});
