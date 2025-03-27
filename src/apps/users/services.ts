import { debugLog } from "../../utils/debugLog";
import { generateUniqueTenantId } from "../../utils/generateTenantId";
import { withTransaction } from "../../utils/withTransaction";
import {
  hashPassword,
  sendSuperAdminActivationEmail,
} from "../authentication/services";
import User, { Roles, UserCreationAttributes } from "./models/user";

export const findUserById = async (id: string, attributes?: string[]) => {
  return User.findByPk(id, { attributes });
};

export const findUserByEmail = async (email: string) => {
  return User.findOne({ where: { email } });
};

export const cleanUserData = (user: User) => {
  const [firstName, lastName] = user.name.split(" ");
  const isSuperAdmin = user.userRole === Roles.SUPERADMIN;
  const isHr = user.userRole === Roles.ADMIN;
  const isStaff = user.userRole === Roles.STAFF;
  return {
    id: user.id,
    name: user.name,
    firstName,
    lastName,
    phoneNumber: user.phoneNumber,
    role: user.userRole,
    tenantId: user.tenantId,
    email: user.email,
    isSuperAdmin,
    isHr,
    isStaff,
  };
};

export const createUser = async (userData: UserCreationAttributes) => {
  if (!userData.email) throw new Error("Email is required");
  if (!userData.password) throw new Error("Password is required");

  const hashedPassword = await hashPassword(userData.password);

  return withTransaction(async (transaction) => {
    const user = await User.create(
      {
        ...userData,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        isActive: false,
      },
      { transaction }
    );

    await sendSuperAdminActivationEmail(user);

    return user;
  });
};

// Create a staff user
export const createStaff = async (userData: UserCreationAttributes) => {
  return createUser({
    ...userData,
    userRole: Roles.STAFF,
  });
};

// Create an Hr user
export const createAdmin = async (userData: UserCreationAttributes) => {
  return createUser({
    ...userData,
    userRole: Roles.ADMIN,
  });
};

// Create a superuser
export const createSuperAdmin = async (userData: UserCreationAttributes) => {
  const tenantIdIfNone = userData.tenantId || (await generateUniqueTenantId());

  debugLog({ tenantId: userData.tenantId, tenantIdIfNone });

  const isSuperAdmin = userData.userRole === Roles.SUPERADMIN;

  if (isSuperAdmin && userData.tenantId) {
    const superAdminHasCreatedAnAccount = await User.findOne({
      where: { tenantId: userData.tenantId },
    });

    if (superAdminHasCreatedAnAccount) {
      throw new Error("Company already exists");
    }
  }
  return createUser({
    ...userData,
    tenantId: tenantIdIfNone,
    userRole: Roles.SUPERADMIN,
  });
};

// Deactivate a user account
export const deactivateUser = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) throw new Error("Account not found");

  user.deletedAt = new Date();
  await user.save();
  return user;
};

// Delete a user account
export const deleteUser = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) throw new Error("Account not found");

  await user.destroy();
  return user;
};
