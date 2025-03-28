import GlobalUser from "../models";

export const findGlobalUserByEmail = async (email: string) => {
  return await GlobalUser.findOne({ where: { email } });
};
export const findGlobalUserById = async (id: string) => {
  return await GlobalUser.findByPk(id);
};
