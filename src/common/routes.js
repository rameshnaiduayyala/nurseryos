import { Router } from 'express';

// Import all 24 module routers (added pos-sales)
import authRoutes from '../modules/auth/auth.routes.js';
import usersRoutes from '../modules/users/users.routes.js';
import nurseriesRoutes from '../modules/nurseries/nurseries.routes.js';
import nurseryBlocksRoutes from '../modules/nursery-blocks/nursery-blocks.routes.js';
import plantsRoutes from '../modules/plants/plants.routes.js';
import plantCategoriesRoutes from '../modules/plant-categories/plant-categories.routes.js';
import plantVarietiesRoutes from '../modules/plant-varieties/plant-varieties.routes.js';
import bagSizesRoutes from '../modules/bag-sizes/bag-sizes.routes.js';
import heightStandardsRoutes from '../modules/height-standards/height-standards.routes.js';
import inventoryRoutes from '../modules/inventory/inventory.routes.js';
import reservationsRoutes from '../modules/reservations/reservations.routes.js';
import procurementRoutes from '../modules/procurement/procurement.routes.js';
import customersRoutes from '../modules/customers/customers.routes.js';
import quotationsRoutes from '../modules/quotations/quotations.routes.js';
import vehiclesRoutes from '../modules/vehicles/vehicles.routes.js';
import driversRoutes from '../modules/drivers/drivers.routes.js';
import supervisorsRoutes from '../modules/supervisors/supervisors.routes.js';
import tripsRoutes from '../modules/trips/trips.routes.js';
import collectionsRoutes from '../modules/collections/collections.routes.js';
import invoicesRoutes from '../modules/invoices/invoices.routes.js';
import paymentsRoutes from '../modules/payments/payments.routes.js';
import reportsRoutes from '../modules/reports/reports.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import posSalesRoutes from '../modules/pos-sales/pos-sales.routes.js';
import approvalRequestsRoutes from '../modules/approval-requests/approval-requests.routes.js';
import plansRoutes from '../modules/plans/plans.routes.js';
import notificationsRoutes from '../modules/notifications/notifications.routes.js';

const apiRouter = Router();

// Mount all routers
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/nurseries', nurseriesRoutes);
apiRouter.use('/nursery-blocks', nurseryBlocksRoutes);
apiRouter.use('/plants', plantsRoutes);
apiRouter.use('/plant-categories', plantCategoriesRoutes);
apiRouter.use('/plant-varieties', plantVarietiesRoutes);
apiRouter.use('/bag-sizes', bagSizesRoutes);
apiRouter.use('/height-standards', heightStandardsRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/reservations', reservationsRoutes);
apiRouter.use('/procurement', procurementRoutes);
apiRouter.use('/customers', customersRoutes);
apiRouter.use('/quotations', quotationsRoutes);
apiRouter.use('/vehicles', vehiclesRoutes);
apiRouter.use('/drivers', driversRoutes);
apiRouter.use('/supervisors', supervisorsRoutes);
apiRouter.use('/trips', tripsRoutes);
apiRouter.use('/collections', collectionsRoutes);
apiRouter.use('/invoices', invoicesRoutes);
apiRouter.use('/payments', paymentsRoutes);
apiRouter.use('/reports', reportsRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/pos-sales', posSalesRoutes);
apiRouter.use('/approval-requests', approvalRequestsRoutes);
apiRouter.use('/plans', plansRoutes);
apiRouter.use('/notifications', notificationsRoutes);

export default apiRouter;
