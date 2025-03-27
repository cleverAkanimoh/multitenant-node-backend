import { v4 as uuidv4 } from "uuid";
import User from "../apps/users/models/user";
import { tenantKeywords } from "./constants/tenantKeywords";

export const generateTenantId = (): string => {
  const randomId = uuidv4().split("-")[0];
  const randomDigits = Math.floor(
    10000000 + Math.random() * 90000000
  ).toString();

  const randomKeyword =
    tenantKeywords[Math.floor(Math.random() * tenantKeywords.length)];
  return `${randomKeyword}-${randomId}-${randomDigits}`;
};

export const generateUniqueTenantId = async (): Promise<string> => {
  let tenantId;
  let isUnique = false;
  let attempt = 0;
  const maxAttempts = 5;

  while (!isUnique && attempt < maxAttempts) {
    tenantId = generateTenantId();
    const existingUser = await User.findOne({ where: { tenantId } });
    if (!existingUser) {
      isUnique = true;
    }
    attempt++;
  }

  if (!isUnique) {
    throw new Error(
      "Unable to generate a unique tenantId after multiple attempts. Please try again later"
    );
  }

  return tenantId!;
};
