export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  category: PostCategory;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  author: Profile;
  like_count: number;
  comment_count: number;
  user_has_liked: boolean;
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
