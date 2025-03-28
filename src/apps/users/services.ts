import {
  createTenantSchema,
  deleteTenantSchema,
  getTenantModel,
} from "../../core/multitenancy";
import { debugLog } from "../../utils/debugLog";
import { generateUniqueTenantId } from "../../utils/generateTenantId";
import { withTransaction } from "../../utils/withTransaction";
import {
  hashPassword,
  sendAccountVerificationEmail,
} from "../authentication/services";
import Company from "../company/models";
import GlobalUser from "../shared/models";
import User, { Roles, UserCreationAttributes } from "./models/user";

export const findUserById = async (id: string, attributes?: string[]) => {
  return User.findByPk(id, { attributes });
};

export const findUserByEmail = async (email: string) => {
  return User.findOne({ where: { email } });
};

export const cleanUserData = async (gUser: GlobalUser) => {
  const TenantUser = getTenantModel(User, gUser.tenantId);

  const user = await TenantUser.findByPk(gUser.id);

  const [firstName, lastName] = user.name.split(" ");
  const isSuperAdmin = user.userRole === Roles.SUPERADMIN;
  const isHr = user.userRole === Roles.ADMIN;
  const isStaff = user.userRole === Roles.STAFF;

  const cleanData = {
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
    hasCompletedCompanyProfile: user.isNewRecord,
    isNewUser: user.isNewRecord,
  };
  return cleanData;
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

export const createSuperAdmin = async (userData: UserCreationAttributes) => {
  const tenantIdIfNone = userData.tenantId || (await generateUniqueTenantId());
  const isSuperAdmin = userData.userRole === Roles.SUPERADMIN;

  const hashedPassword = await hashPassword(userData.password);

  if (isSuperAdmin && userData.tenantId) {
    const superAdminExists = await User.findOne({
      where: { tenantId: userData.tenantId },
    });

    if (superAdminExists) {
      throw new Error("Company already exists");
    }
  }

  await createTenantSchema(tenantIdIfNone);

  const TenantCompany = getTenantModel(Company, tenantIdIfNone);
  const TenantUser = getTenantModel(User, tenantIdIfNone);

  TenantCompany.hasMany(TenantUser, {
    foreignKey: { name: "tenantId", allowNull: false },
    as: tenantIdIfNone + "-users",
    onDelete: "CASCADE",
  });
  TenantUser.belongsTo(TenantCompany, {
    foreignKey: { name: "tenantId", allowNull: false },
    as: tenantIdIfNone + "-company",
  });

  await TenantCompany.sync({ alter: true });
  await TenantUser.sync({ alter: true });

  try {
    return await withTransaction(async (transaction) => {
      const company = (await TenantCompany.create(
        {
          id: tenantIdIfNone,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
        },
        { transaction }
      )) as Company;

      // Then create the superadmin user
      const newUser = (await TenantUser.create(
        {
          ...userData,
          email: userData.email.toLowerCase(),
          password: hashedPassword,
          tenantId: tenantIdIfNone,
          userRole: Roles.SUPERADMIN,
          isActive: false,
          isStaff: true,
        },
        { transaction }
      )) as User;

      // Update the company record with the new user's ID as ownerId
      company.ownerId = newUser.id;
      await company.save({ transaction });

      const gUser = await GlobalUser.create(
        {
          id: newUser.id,
          email: newUser.email,
          name: newUser.email,
          password: hashedPassword,
          tenantId: tenantIdIfNone,
          userRole: newUser.userRole,
        },
        { transaction }
      );

      await sendAccountVerificationEmail(gUser);

      return newUser;
    });
  } catch (error) {
    debugLog("Deleting tenant schema");
    await deleteTenantSchema(tenantIdIfNone);
    throw error;
  }
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
