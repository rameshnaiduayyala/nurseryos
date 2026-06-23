import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';

export const createApprovalRequest = async (data, userId, userRole) => {
  const { entityType, entityId, priority, note } = data;

  const validEntityTypes = ['RESERVATION', 'PROCUREMENT_ORDER', 'COLLECTION', 'NURSERY', 'PLAN'];
  if (!validEntityTypes.includes(entityType)) {
    throw ApiError.badRequest(
      `Invalid entity type. Allowed: ${validEntityTypes.join(', ')}`
    );
  }

  const existing = await prisma.approvalRequest.findFirst({
    where: {
      entityType,
      entityId,
      status: { in: ['PENDING', 'UNDER_REVIEW'] },
    },
  });

  if (existing) {
    throw ApiError.badRequest(
      'An active approval request already exists for this entity'
    );
  }

  const request = await prisma.approvalRequest.create({
    data: {
      requesterId: userId,
      requesterRole: userRole,
      entityType,
      entityId,
      priority: priority || 'MEDIUM',
      note,
    },
  });

  return request;
};

export const getApprovalRequests = async (user) => {
  const where = {};

  if (user.role === 'ADMIN') {
    where.status = { in: ['PENDING', 'UNDER_REVIEW'] };
  } else if (user.role === 'FARMER') {
    where.requesterRole = 'EXPORTER';
    where.status = { in: ['PENDING', 'UNDER_REVIEW'] };
  } else if (user.role === 'EXPORTER') {
    where.requesterId = user.id;
  } else {
    return [];
  }

  return prisma.approvalRequest.findMany({
    where,
    include: {
      requester: {
        select: { id: true, fullName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getApprovalRequestById = async (id, user) => {
  const request = await prisma.approvalRequest.findUnique({
    where: { id },
    include: {
      requester: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  if (!request) {
    throw ApiError.notFound('Approval request not found');
  }

  if (
    user.role !== 'ADMIN' &&
    user.role !== 'FARMER' &&
    request.requesterId !== user.id
  ) {
    throw ApiError.forbidden('Forbidden to view this approval request');
  }

  return request;
};

export const reviewApprovalRequest = async (id, userId, userRole, status, reviewNote) => {
  const request = await prisma.approvalRequest.findUnique({ where: { id } });

  if (!request) {
    throw ApiError.notFound('Approval request not found');
  }

  if (request.status !== 'PENDING' && request.status !== 'UNDER_REVIEW') {
    throw ApiError.badRequest(
      `Cannot review request in '${request.status}' state`
    );
  }

  const reviewerRole = userRole;
  const canReview =
    reviewerRole === 'ADMIN' ||
    (reviewerRole === 'FARMER' && request.requesterRole === 'EXPORTER');

  if (!canReview) {
    throw ApiError.forbidden('You are not authorized to review this request');
  }

  if (request.requesterId === userId) {
    throw ApiError.forbidden('You cannot review your own approval request');
  }

  const updated = await prisma.approvalRequest.update({
    where: { id },
    data: {
      status,
      reviewedBy: userId,
      reviewedAt: new Date(),
      reviewNote,
    },
  });

  return updated;
};
