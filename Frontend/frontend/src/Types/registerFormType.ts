type registerFormType = {
  name: string;
  email: string;
  password: string;
};

export type { registerFormType };

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneCode: string;
  phone: string;
  campus: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
};

export type { RegisterFormValues };
