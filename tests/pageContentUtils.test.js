import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeFields,
  validateFields,
  safeContentLink,
  safeImage,
} from "../src/lib/pageContentUtils.js";
const fields = {
  title: { type: "text", label: "Title", default: "Original" },
  enabled: { type: "boolean", label: "Visible", default: true },
  destination: { type: "link", label: "Destination", default: "/about" },
  email: { type: "email", label: "Email", default: "hello@example.com" },
  image: { type: "image", label: "Image", default: "/photo.jpg" },
  items: {
    type: "list",
    label: "Values",
    default: [{ title: "Innovation" }],
    fields: { title: { type: "text", label: "Title", default: "" } },
  },
};
const valid = () => normalizeFields(fields);
test("partial content keeps defaults and ignores unknown fields", () => {
  const result = normalizeFields(fields, {
    title: "Edited",
    unknown: "ignore",
  });
  assert.equal(result.title, "Edited");
  assert.equal(result.enabled, true);
  assert.equal(result.destination, "/about");
  assert.deepEqual(result.items, [{ title: "Innovation" }]);
  assert.equal("unknown" in result, false);
});
test("intentional empty lists, empty text and false visibility survive normalization", () => {
  const result = normalizeFields(fields, {
    title: "",
    enabled: false,
    items: [],
  });
  assert.equal(result.title, "");
  assert.equal(result.enabled, false);
  assert.deepEqual(result.items, []);
});
test("malformed stored arrays and toggles cannot break public renderers", () => {
  const result = normalizeFields(fields, {
    enabled: "false",
    items: "wrong shape",
  });
  assert.equal(result.enabled, true);
  assert.deepEqual(result.items, [{ title: "Innovation" }]);
  assert.deepEqual(
    normalizeFields(fields, { items: [null, { title: 12 }] }).items,
    [{ title: "" }, { title: "" }],
  );
});
test("defaults are deep cloned so editing a draft cannot mutate fallback content", () => {
  const result = normalizeFields(fields);
  result.items[0].title = "Changed";
  assert.equal(fields.items.default[0].title, "Innovation");
});
test("only site paths, anchors and HTTP links are allowed", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "//evil.example",
    "/\\evil.example",
    "/\nevil.example",
  ])
    assert.equal(safeContentLink(value), "");
  assert.equal(safeContentLink("/gallery?event=123"), "/gallery?event=123");
  assert.equal(safeContentLink("#team"), "#team");
  assert.equal(safeContentLink("https://example.com"), "https://example.com/");
});
test("images reject executable, data and protocol-relative URLs", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:image/svg+xml,test",
    "//evil.example",
  ])
    assert.equal(safeImage(value), "");
  assert.equal(safeImage("/photo.jpg"), "/photo.jpg");
  assert.equal(
    safeImage("https://example.com/a.jpg"),
    "https://example.com/a.jpg",
  );
});
test("unsafe draft links are rejected rather than silently published as defaults", () => {
  const draft = valid();
  draft.destination = "javascript:alert(1)";
  assert.throws(
    () => validateFields(fields, draft, "Hero"),
    /Destination.*HTTP/,
  );
});
test("invalid emails, image URLs and boolean types block saves", () => {
  const draft = valid();
  draft.email = "not email";
  assert.throws(() => validateFields(fields, draft, "Contact"), /valid email/);
  draft.email = "hello@example.com";
  draft.image = "data:image/png,invalid";
  assert.throws(() => validateFields(fields, draft, "Contact"), /image path/);
  draft.image = "/photo.jpg";
  draft.enabled = "yes";
  assert.throws(
    () => validateFields(fields, draft, "Contact"),
    /enabled or disabled/,
  );
});
test("large collections and oversized text are rejected at publish time", () => {
  const draft = valid();
  draft.items = Array.from({ length: 101 }, () => ({ title: "Value" }));
  assert.throws(() => validateFields(fields, draft, "Home"), /100 items/);
  draft.items = [];
  draft.title = "x".repeat(12001);
  assert.throws(() => validateFields(fields, draft, "Home"), /12,000/);
});
test("valid repeatable content publishes with no mutation", () => {
  const draft = valid();
  draft.items = [{ title: "Innovation" }, { title: "Community" }];
  assert.doesNotThrow(() => validateFields(fields, draft, "Home"));
  assert.equal(draft.items.length, 2);
});
