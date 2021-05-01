export interface UserProfile {
  userId: number;
  username: string;
  email: string;
}

export type PersistedUser = {hashedPassword: string} & UserProfile;

export type ClientUser = {password: string} & UserProfile;

export function userProfileFrom(user: PersistedUser | ClientUser): UserProfile {
  const userProfile = {
    userId: user.userId,
    username: user.username,
    email: user.email,
  };

  return userProfile;
}
