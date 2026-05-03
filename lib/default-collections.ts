import answersDefinition from "@/content/answers/_type.json";
import audiosDefinition from "@/content/audios/_type.json";
import chatsDefinition from "@/content/chats/_type.json";
import linksDefinition from "@/content/links/_type.json";
import photosDefinition from "@/content/photos/_type.json";
import photosetsDefinition from "@/content/photosets/_type.json";
import postsDefinition from "@/content/posts/_type.json";
import quotesDefinition from "@/content/quotes/_type.json";
import textsDefinition from "@/content/texts/_type.json";
import usersDefinition from "@/content/users/_type.json";
import videosDefinition from "@/content/videos/_type.json";
import {
  type CollectionDefinition,
  normalizeCollectionDefinition,
  orderCollectionDefinitions,
  postCollectionDefinition,
} from "@/lib/content-schema";

const bundledCollectionDefinitions = [
  postsDefinition,
  answersDefinition,
  audiosDefinition,
  chatsDefinition,
  linksDefinition,
  photosDefinition,
  photosetsDefinition,
  quotesDefinition,
  textsDefinition,
  usersDefinition,
  videosDefinition,
];

export const defaultCollectionDefinitions: CollectionDefinition[] = orderCollectionDefinitions(
  bundledCollectionDefinitions.map((definition) => normalizeCollectionDefinition(definition)),
);

export const defaultPostCollectionDefinition =
  defaultCollectionDefinitions.find((collection) => collection.id === postCollectionDefinition.id) ?? postCollectionDefinition;

export function mergeCollectionDefinitions(collections: CollectionDefinition[]) {
  const byId = new Map(defaultCollectionDefinitions.map((collection) => [collection.id, collection]));

  collections.forEach((collection) => {
    byId.set(collection.id, collection);
  });

  return orderCollectionDefinitions([...byId.values()]);
}
