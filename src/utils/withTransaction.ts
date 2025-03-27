import { Transaction } from "sequelize";
import sequelize from "../core/orm";
import { debugLog } from "./debugLog";

/**
 * Executes a function within a Sequelize transaction.
 * Rolls back if an error occurs, commits otherwise.
 *
 * @template T - Return type of the callback function.
 * @param {Function} callback - Function executed within the transaction.
 * @returns {Promise<T>} - The result of the callback function.
 */
export const withTransaction = async <T>(
  callback: (transaction: Transaction) => Promise<T>
): Promise<T> => {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    debugLog("Rollback changes due to error ", error);
    await transaction.rollback();
    throw error;
  }
};
