
export type TUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;
  role: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TUserRes = {
    success: boolean;
    user: TUser;
}

export type TLoginUserRes = {
    success: boolean;
    accessToken: string;
    user: TUser;
}

export type TGetAllUsersRes = {
    success: boolean;
    users: TUser[];
}

export type TDeleteRes = {
    success: boolean;
    message: string;
}

export type TUpdatePasswordReq = {
  oldPassword: string;
  newPassword: string;
};

export type TUpdateUserPasswordReq = {
  userId: string;
  newPassword: string;
};

export type TUpdateUserRoleReq = {
  userId: string;
  role: number;
};