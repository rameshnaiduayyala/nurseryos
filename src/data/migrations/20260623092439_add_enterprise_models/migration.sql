-- CreateTable
CREATE TABLE "approval_requests" (
    "id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "requester_role" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "note" TEXT,
    "reviewedBy" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_plans" (
    "id" TEXT NOT NULL,
    "exporter_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'DELIVERY',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "planned_date" TIMESTAMP(3),
    "total_stops" INTEGER NOT NULL DEFAULT 0,
    "total_quantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_stops" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "nursery_id" TEXT NOT NULL,
    "stop_order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "planned_quantity" INTEGER NOT NULL,
    "collected_quantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "arrived_at" TIMESTAMP(3),
    "departed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "reference_id" TEXT,
    "reference_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "operational_plans" ADD CONSTRAINT "operational_plans_exporter_id_fkey" FOREIGN KEY ("exporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_stops" ADD CONSTRAINT "plan_stops_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "operational_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_stops" ADD CONSTRAINT "plan_stops_nursery_id_fkey" FOREIGN KEY ("nursery_id") REFERENCES "nurseries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
