import { slugify } from "@/lib/utils";

export const contentFieldTypes = ["text", "textarea", "date", "boolean", "select", "list", "tags"] as const;

export type ContentFieldType = (typeof contentFieldTypes)[number];

export type ContentFieldDefinition = {
  name: string;
  label: string;
  type: ContentFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

export type CollectionDefinition = {
  id: string;
  label: string;
  pluralLabel: string;
  description: string;
  route: string;
  bodyLabel?: string;
  bodyPlaceholder?: string;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
  fields: ContentFieldDefinition[];
};

const reservedFieldNames = new Set(["title", "description", "body", "slug", "collection", "route"]);

export const reservedCollectionRoutes = ["about", "dashboard", "posts"] as const;

export const postCollectionDefinition: CollectionDefinition = {
  id: "posts",
  label: "Artículo",
  pluralLabel: "Artículos",
  description: "Exploraciones críticas en la intersección de tecnología, sociedad y pensamiento latinoamericano.",
  route: "posts",
  bodyLabel: "Cuerpo",
  bodyPlaceholder: "Escribe el artículo en Markdown.",
  sort: {
    field: "date",
    direction: "desc",
  },
  fields: [
    {
      name: "date",
      label: "Fecha",
      type: "date",
      required: true,
    },
    {
      name: "tags",
      label: "Tags",
      type: "tags",
      required: true,
      placeholder: "tecnología, sociedad",
    },
  ],
};

export function normalizeContentSegment(value: string) {
  return slugify(value).replace(/^-+|-+$/g, "");
}

export function fieldNameFromLabel(value: string) {
  return normalizeContentSegment(value).replaceAll("-", "_");
}

export function isSafeContentSegment(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function isSafeFieldName(value: string) {
  return /^[a-z][a-z0-9_]*$/.test(value);
}

export function isReservedCollectionRoute(route: string) {
  return reservedCollectionRoutes.includes(route as (typeof reservedCollectionRoutes)[number]);
}

export function normalizeCollectionDefinition(input: unknown): CollectionDefinition {
  if (!isRecord(input)) {
    throw new Error("Collection definition must be an object.");
  }

  const id = normalizeContentSegment(readString(input, "id"));
  const route = normalizeContentSegment(readOptionalString(input, "route") || id);

  if (!isSafeContentSegment(id)) {
    throw new Error("Collection id must be a URL-safe slug.");
  }

  if (!isSafeContentSegment(route)) {
    throw new Error("Collection route must be a URL-safe slug.");
  }

  const fieldsInput = Array.isArray(input.fields) ? input.fields : [];
  const seenFields = new Set<string>();
  const fields = fieldsInput.map((fieldInput) => {
    const field = normalizeFieldDefinition(fieldInput);

    if (reservedFieldNames.has(field.name)) {
      throw new Error(`Field "${field.name}" is reserved.`);
    }

    if (seenFields.has(field.name)) {
      throw new Error(`Field "${field.name}" is duplicated.`);
    }

    seenFields.add(field.name);
    return field;
  });

  return {
    id,
    label: readString(input, "label"),
    pluralLabel: readOptionalString(input, "pluralLabel") || `${readString(input, "label")}s`,
    description: readOptionalString(input, "description"),
    route,
    bodyLabel: readOptionalString(input, "bodyLabel") || undefined,
    bodyPlaceholder: readOptionalString(input, "bodyPlaceholder") || undefined,
    sort: normalizeSort(input.sort),
    fields,
  };
}

export function orderCollectionDefinitions(collections: CollectionDefinition[]) {
  return [...collections].sort((a, b) => {
    if (a.id === postCollectionDefinition.id) {
      return -1;
    }

    if (b.id === postCollectionDefinition.id) {
      return 1;
    }

    return a.pluralLabel.localeCompare(b.pluralLabel, "es");
  });
}

function normalizeFieldDefinition(input: unknown): ContentFieldDefinition {
  if (!isRecord(input)) {
    throw new Error("Field definition must be an object.");
  }

  const label = readString(input, "label");
  const name = readOptionalString(input, "name") || fieldNameFromLabel(label);
  const typeInput = readOptionalString(input, "type");
  const type: ContentFieldType = contentFieldTypes.includes(typeInput as ContentFieldType)
    ? (typeInput as ContentFieldType)
    : "text";
  const options = Array.isArray(input.options)
    ? input.options.map((option) => String(option).trim()).filter(Boolean)
    : undefined;

  if (!isSafeFieldName(name)) {
    throw new Error(`Field "${name}" must use letters, numbers, and underscores.`);
  }

  return {
    name,
    label,
    type,
    required: Boolean(input.required),
    placeholder: readOptionalString(input, "placeholder") || undefined,
    options,
  };
}

function normalizeSort(input: unknown): CollectionDefinition["sort"] {
  if (!isRecord(input)) {
    return undefined;
  }

  const field = readOptionalString(input, "field");
  const direction = input.direction === "asc" ? "asc" : "desc";

  if (!field || !isSafeFieldName(field)) {
    return undefined;
  }

  return { field, direction };
}

function readString(input: Record<string, unknown>, key: string) {
  const value = readOptionalString(input, key);

  if (!value) {
    throw new Error(`Collection definition is missing "${key}".`);
  }

  return value;
}

function readOptionalString(input: Record<string, unknown>, key: string) {
  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
