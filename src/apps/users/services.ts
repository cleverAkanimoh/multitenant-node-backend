import { withTransaction } from "../../utils/withTransaction";
import { hashPassword } from "../authentication/services";
import User, { Roles, UserCreationAttributes } from "./models/user";

export const findUserById = async (id: string, attributes?: string[]) => {
  return User.findByPk(id, { attributes });
};

export const findUserByEmail = async (email: string) => {
  return User.findOne({ where: { email } });
};

export const cleanUserData = (user: User) => {
  const [firstName, lastName] = user.name.split(" ");
  return {
    id: user.id,
    name: user.name,
    firstName,
    lastName,
    role: user.userRole,
    tenantId: user.tenantId,
    email: user.email,
  };
};

export const createUser = async (userData: UserCreationAttributes) => {
  if (!userData.email) throw new Error("Email is required");

  const hashedPassword = await hashPassword(userData.password);

  return withTransaction(async (transaction) => {
    return await User.create(
      {
        ...userData,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
      },
      { transaction }
    );
  });
};

// Create a staff user
export const createStaff = async (userData: UserCreationAttributes) => {
  return createUser({
    ...userData,
    userRole: Roles.STAFF,
    isActive: true,
  });
};

// Create an Hr user
export const createAdmin = async (userData: UserCreationAttributes) => {
  return createUser({
    ...userData,
    userRole: Roles.ADMIN,
    isActive: true,
  });
};

// Create a superuser
export const createSuperAdmin = async (userData: UserCreationAttributes) => {
  return createUser({
    ...userData,
    userRole: Roles.SUPERADMIN,
    isActive: true,
  });
};
