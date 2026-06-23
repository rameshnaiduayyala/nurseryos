import prisma from '../../config/database.js';
import logger from '../../config/logger.js';

/**
 * Log an operational action to the database audit_logs table
 * 
 * @param {string|null} userId ID of the user performing the action
 * @param {string} action Description of the action (e.g., 'APPROVE_NURSERY', 'UPDATE_USER')
 * @param {string} entityName Database table name or logical entity (e.g., 'Nursery', 'User')
 * @param {string|null} entityId Primary key of the modified record
 * @param {Object|null} oldValues Previous state of modified attributes
 * @param {Object|null} newValues Updated state of modified attributes
 * @param {Object|null} req Express Request object to capture IP and User Agent
 */
export const logAudit = async (userId, action, entityName, entityId, oldValues = null, newValues = null, req = null) => {
  try {
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
      userAgent = req.headers['user-agent'] || null;
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityName,
        entityId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    logger.error('Failed to write audit log entry:', error);
  }
};
