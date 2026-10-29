export interface ApiAuthSuccess {
  token: string;
  user: {
    id: string;
    phoneNumber: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role: string;
    isSuperAdmin?: boolean;
  };
}

export interface RegisterInput {
  phoneNumber: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}
