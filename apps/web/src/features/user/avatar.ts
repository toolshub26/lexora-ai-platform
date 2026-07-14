export interface UserAvatar {
  url: string;
  updatedAt: Date;
}

export class UserAvatarService {
  async uploadAvatar(
    userId: string,
    _file: File,
  ): Promise<UserAvatar | null> {
    console.log("Uploading avatar:", userId);
    return null;
  }

  async deleteAvatar(
    userId: string,
  ): Promise<void> {
    console.log("Deleting avatar:", userId);
  }
}

export const userAvatarService =
  new UserAvatarService();
