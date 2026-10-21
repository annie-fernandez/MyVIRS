export interface LegacyUserSource {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  displayUsername?: string | null;
  userLevel?: string | null;
}

/** The old `User` JSON, minus the password the old API used to leak. */
export function toLegacyUser(user: LegacyUserSource) {
  return {
    id: user.id,
    fullName: user.name,
    userName: user.displayUsername ?? user.username ?? "",
    email: user.email,
    userLevel: user.userLevel || null,
  };
}
