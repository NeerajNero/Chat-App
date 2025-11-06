// This type must match the "PublicUser" we created in our NestJS service.
// It's the user object *without* the password.
export type User = {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string | null;
  bio: string | null;
  gender: string | null; // We can use string here, or define the Enums
  profileImage: string | null;
  status: string; // "ONLINE" | "OFFLINE"
  createdAt: string; // Dates will be strings in JSON
};

// This matches the return type of our login/signup routes
export type AuthResponse = {
  jwtToken: {
    access_token: string;
  };
  user: User;
};

// This is the "safe" user data our /users endpoint will return
export type PublicUser = {
  id: string;
  userName: string;
  profileImage: string | null;
  status: string; // "ONLINE" | "OFFLINE"
};

export type MessageSender = {
  id: string;
  userName: string;
  profileImage: string | null;
}

export interface Message {
  id: string;
  content: string;
  type: string; // "TEXT" | "IMAGE" | "FILE"
  createdAt: string;
  senderId: string;
  conversationId: string;
  sender: MessageSender;
}