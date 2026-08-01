export interface LinkedInUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
}

export interface UserProfile {
  id: string;
  name: string;
  givenName: string;
  familyName: string;
  picture: string;
  coverPhoto: string;
  email: string;
  headline: string;
  about: string;
  location: string;
  industry: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  connectionsCount: number;
  isCurrentUser: boolean;
}

export interface Skill {
  name: string;
  endorsements: number;
  endorsedByMe: boolean;
}

export interface Activity {
  id: string;
  type: 'post' | 'comment' | 'like' | 'job' | 'connection' | 'profile_edit';
  text: string;
  timestamp: number;
}

export interface ProfileAnalytics {
  profileViews: number;
  postImpressions: number;
  searchAppearances: number;
  viewerCount: number;
  weeklyViews: { day: string; views: number }[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPicture: string;
  authorHeadline: string;
  content: string;
  timestamp: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPicture: string;
  authorHeadline: string;
  content: string;
  image: string | null;
  timestamp: number;
  likes: string[];
  comments: Comment[];
  shares: number;
  saved: boolean;
}

export interface Connection {
  id: string;
  name: string;
  picture: string;
  headline: string;
  location: string;
  mutualConnections: number;
  connected: boolean;
  pendingSent: boolean;
  pendingReceived: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  workType: 'Remote' | 'On-site' | 'Hybrid' | 'Remoto' | 'Presencial' | 'Híbrido';
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Tiempo completo' | 'Medio tiempo' | 'Contrato' | 'Pasantía';
  description: string;
  requirements: string[];
  salary: string;
  postedDate: number;
  applicants: number;
  easyApply: boolean;
  applied: boolean;
  saved: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantPicture: string;
  participantHeadline: string;
  messages: ChatMessage[];
  unread: number;
}

export interface AppNotification {
  id: string;
  type: 'like' | 'comment' | 'connection' | 'job' | 'message' | 'mention';
  actorName: string;
  actorPicture: string;
  text: string;
  timestamp: number;
  read: boolean;
}
