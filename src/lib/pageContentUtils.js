import { normalizeImageDisplay } from "./imageDisplay.js";
export function safeContentLink(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const clean = value.trim();
  if (
    /^\/(?!\/)/.test(clean) &&
    !/[\\\s]/.test(clean) &&
    !Array.from(clean).some((char) => char.charCodeAt(0) < 32)
  )
    return clean;
  if (/^#[a-zA-Z][\w-]*$/.test(clean)) return clean;
  try {
    const url = new URL(clean);
    if (["https:", "http:"].includes(url.protocol)) return url.href;
  } catch {
    /* Reject executable and malformed URLs. */
  }
  return fallback;
}
export function safeImage(value) {
  if (typeof value !== "string") return "";
  if (
    /^\/(?!\/)/.test(value) &&
    !value.includes("\\") &&
    !Array.from(value).some((char) => char.charCodeAt(0) < 32)
  )
    return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
export function normalizeFields(fields, input = {}) {
  const result = Object.fromEntries(
    Object.entries(fields).map(([key, field]) => {
      const value = input?.[key];
      let result = structuredClone(field.default);
      if (field.type === "list" && Array.isArray(value))
        result = value
          .slice(0, 100)
          .map((item) => normalizeFields(field.fields, item));
      else if (field.type === "boolean" && typeof value === "boolean")
        result = value;
      else if (
        !["list", "boolean"].includes(field.type) &&
        typeof value === "string"
      )
        result =
          field.type === "link"
            ? safeContentLink(value, field.default)
            : field.type === "image"
              ? safeImage(value)
              : value.slice(0, 12000);
      return [key, result];
    }),
  );
  for (const [key, field] of Object.entries(fields))
    if (field.type === "image")
      result[`${key}_display`] = normalizeImageDisplay(
        input?.[`${key}_display`],
      );
  return result;
}

export function validateFields(fields, data, label) {
  for (const [key, field] of Object.entries(fields)) {
    const value = data?.[key];
    const name = `${label}: ${field.label}`;
    if (field.type === "list") {
      if (!Array.isArray(value) || value.length > 100)
        throw new Error(`${name} supports up to 100 items.`);
      value.forEach((item, i) =>
        validateFields(field.fields, item, `${name} ${i + 1}`),
      );
    } else if (field.type === "boolean") {
      if (typeof value !== "boolean")
        throw new Error(`${name} must be enabled or disabled.`);
    } else {
      if (typeof value !== "string" || value.length > 12000)
        throw new Error(`${name} must be text under 12,000 characters.`);
      if (field.type === "link" && value && !safeContentLink(value))
        throw new Error(
          `${name} needs a site path or complete HTTP/HTTPS URL.`,
        );
      if (field.type === "image" && value && !safeImage(value))
        throw new Error(
          `${name} needs an image path or complete HTTP/HTTPS URL.`,
        );
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        throw new Error(`${name} needs a valid email address.`);
    }
  }
}
