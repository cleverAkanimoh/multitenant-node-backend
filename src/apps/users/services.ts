import { withTransaction } from "../../utils/withTransaction";
import { hashPassword } from "../authentication/services";
import User, { Roles, UserCreationAttributes } from "./models/user";

export const getSingleUser = async (email: string, pk?: string) => {
  if (pk) return await User.findByPk(pk);
  return await User.findOne({ where: { email } });
};

export const createUser = async (userData: UserCreationAttributes) => {
  if (!userData.email) throw new Error("Email is required");

  const hashedPassword = await hashPassword(userData.password);

  return withTransaction(async (transaction) => {
    return await User.create(
      { ...userData, password: hashedPassword },
      { transaction }
    );
  });
};

// Create a staff user
export const createStaff = async (input: UserCreationAttributes) => {
  return createUser({
    ...input,
    userRole: Roles.STAFF,
    isStaff: true,
    isActive: true,
  });
};

// Create an admin user
export const createAdmin = async (input: UserCreationAttributes) => {
  return createUser({
    ...input,
    userRole: Roles.ADMIN,
    isStaff: true,
    isActive: true,
  });
};

// Create a superuser
export const createSuperuser = async (input: UserCreationAttributes) => {
  return createUser({
    ...input,
    userRole: Roles.SUPERADMIN,
    isStaff: true,
    isActive: true,
  });
};
