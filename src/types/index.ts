export const SERVICE_TYPES = ["tutoring", "driving", "babysitting", "pet_watching"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];
export type ServiceMode = "offering" | "looking";

export interface ServiceEntry {
  mode: ServiceMode;
  details: string;
}

export type Services = Partial<Record<ServiceType, ServiceEntry>>;

export const SERVICE_LABELS: Record<ServiceType, string> = {
  tutoring: "Tutoring",
  driving: "Driving",
  babysitting: "Babysitting",
  pet_watching: "Pet Watching",
};

export const ROLE_OPTIONS = ["student", "parent", "alumni", "other"] as const;
export type UserRole = (typeof ROLE_OPTIONS)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  parent: "Parent",
  alumni: "Alumni",
  other: "Other",
};

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole | null;
  services: Services | null;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  category: PostCategory;
  image_url: string | null;
  price: number | null;
  created_at: string;
  updated_at: string;
  author: Profile;
  like_count: number;
  comment_count: number;
  user_has_liked: boolean;
  recent_comments: Comment[];
}

export type PostCategory =
  | "general"
  | "tutoring"
  | "babysitting"
  | "for-sale"
  | "events"
  | "recommendations"
  | "lost-found"
  | "jobs";

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender: Profile;
  receiver: Profile;
}

export interface Conversation {
  user: Profile;
  last_message: Message;
  unread_count: number;
}

export interface Purchase {
  id: string;
  post_id: string | null;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission: number;
  status: string;
  created_at: string;
}
