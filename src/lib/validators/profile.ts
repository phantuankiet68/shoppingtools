export type ProfileInput = {
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: string;
  status?: string;
  email?: string;
  backupEmail?: string;
  phone?: string;
  address?: string;
};

export type ValidationError = {
  field: keyof ProfileInput;
  message: string;
};

function isEmpty(v?: string | null) {
  return !v || !v.trim();
}

function isEmail(v?: string) {
  return !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function validateProfileInput(input: ProfileInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (isEmpty(input.firstName)) {
    errors.push({ field: "firstName", message: "First name is required" });
  }

  if (isEmpty(input.lastName)) {
    errors.push({ field: "lastName", message: "Last name is required" });
  }

  if (isEmpty(input.username)) {
    errors.push({ field: "username", message: "Username is required" });
  }

  if (isEmpty(input.role)) {
    errors.push({ field: "role", message: "Role is required" });
  }

  if (isEmpty(input.status)) {
    errors.push({ field: "status", message: "Account status is required" });
  }

  if (isEmpty(input.email)) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isEmail(input.email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  if (isEmpty(input.backupEmail)) {
    errors.push({ field: "backupEmail", message: "Backup email is required" });
  } else if (!isEmail(input.backupEmail)) {
    errors.push({ field: "backupEmail", message: "Invalid backup email format" });
  }

  if (isEmpty(input.phone)) {
    errors.push({ field: "phone", message: "Phone is required" });
  }

  if (isEmpty(input.address)) {
    errors.push({ field: "address", message: "Address is required" });
  }

  return errors;
}
