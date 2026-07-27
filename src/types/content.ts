export interface MediaAssetPayload {
  id?: number;
  title?: string;
  alt_text?: string;
  media_type?: string;
  url?: string;
}

export interface StoryPayload {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  has_body: boolean;
  date_label: string;
  location_label: string;
  read_time: string;
  category: string;
  featured_image: MediaAssetPayload | null;
  is_featured: boolean;
  sort_order: number;
  publish_at: string;
  seo_title?: string;
  seo_description?: string;
}

export interface ImpactVideoPayload {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  thumbnail: MediaAssetPayload | null;
  youtube_url: string;
  video_file: MediaAssetPayload | null;
  source_type: "youtube" | "upload";
  youtube_video_id: string;
  youtube_thumbnail_url: string;
  youtube_embed_url: string;
  effective_thumbnail_url: string;
  category: string;
  published_on: string | null;
  is_featured: boolean;
  sort_order: number;
}
