import { auth } from './auth';
import { users } from './users';
import { nurseries } from './nurseries';
import { plants, categories, varieties, bagSizes, heights } from './plants';
import { inventory, nurseryBlocks } from './inventory';
import { reservations } from './reservations';
import { procurement } from './procurement';
import { trips } from './trips';
import { collections } from './collections';
import { pos } from './pos';
import { vehicles } from './vehicles';
import { drivers } from './drivers';
import { supervisors } from './supervisors';
import { customers } from './customers';
import { quotations } from './quotations';
import { payments } from './payments';
import { invoices } from './invoices';
import { dashboard, reports } from './reports';
import { approvalRequests } from './approvalRequests';
import { plans } from './plans';
import { notifications } from './notifications';

export const api = {
  auth,
  dashboard,
  reports,
  users,
  nurseries,
  nurseryBlocks,
  plants,
  categories,
  varieties,
  bagSizes,
  heights,
  inventory,
  reservations,
  procurement,
  trips,
  collections,
  pos,
  vehicles,
  drivers,
  supervisors,
  customers,
  quotations,
  payments,
  invoices,
  approvalRequests,
  plans,
  notifications,
};
