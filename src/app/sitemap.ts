import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/launches", "/create", "/chat", "/skill.md"].map((path) => ({ url: `${BRAND.url}${path}`, changeFrequency: "daily" }));
}
