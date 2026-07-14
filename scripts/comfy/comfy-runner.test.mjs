import assert from "node:assert/strict"
import test from "node:test"

import {
  buildComfyUrl,
  extractImageOutputs,
  getFirstImageOutput,
  resolvePayloadFiles,
} from "./comfy-runner.mjs"

test("buildComfyUrl supports local ComfyUI endpoints without api prefix", () => {
  const url = buildComfyUrl({
    baseUrl: "http://127.0.0.1:8188/",
    apiPrefix: "",
    pathname: "/view",
    query: {
      filename: "output.png",
      subfolder: "",
      type: "output",
    },
  })

  assert.equal(url, "http://127.0.0.1:8188/view?filename=output.png&subfolder=&type=output")
})

test("buildComfyUrl supports cloud-style api prefix", () => {
  const url = buildComfyUrl({
    baseUrl: "https://example.test",
    apiPrefix: "/api",
    pathname: "/prompt",
  })

  assert.equal(url, "https://example.test/api/prompt")
})

test("extractImageOutputs returns image descriptors from history outputs", () => {
  const images = extractImageOutputs({
    outputs: {
      "9": {
        images: [
          { filename: "first.png", subfolder: "", type: "output" },
        ],
      },
      "10": {
        text: ["ignored"],
      },
    },
  })

  assert.deepEqual(images, [
    { filename: "first.png", subfolder: "", type: "output", nodeId: "9" },
  ])
  assert.equal(getFirstImageOutput({ outputs: { "9": { images } } }).filename, "first.png")
})

test("resolvePayloadFiles filters payloads by slug and limit deterministically", () => {
  const payloads = [
    "zeta.json",
    "alpha.json",
    "beta.json",
  ]

  assert.deepEqual(resolvePayloadFiles({ payloadsDir: "unused", payloads, slug: null, limit: 2 }), [
    "alpha.json",
    "beta.json",
  ])
  assert.deepEqual(resolvePayloadFiles({ payloadsDir: "unused", payloads, slug: "zeta", limit: null }), [
    "zeta.json",
  ])
})
