export type LoginFormErrors = {
  email?: string;
  password?: string;
};

export type RegisterFormErrors = {
  email?: string;
  fullName?: string;
  password?: string;
};

export type LocationFromState = {
  from?: { pathname: string };
};
