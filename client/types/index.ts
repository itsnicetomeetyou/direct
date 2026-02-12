import { Icons } from '@/components/icons';
import {
  DeliveryOptions,
  DocumentPayment,
  PaymentOptions,
  RequestDocuments,
  UserInformation,
  Users
} from '@prisma/client';

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  children?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  sampleDocs?: string;
}

export interface OrderSliceInitialState {
  order: MenuItem[];
  openModalConfirmationOrder: boolean;
  orderData: {
    orderItem: MenuItem[];
    shippingOptions: DeliveryOptions | null;
    address: {
      googleMapAddress: string | null;
      longitude: number | null;
      latitude: number | null;
      additionalAddress: string | null;
    };
    schedule: Date | null;
    paymentMethod: PaymentOptions | null;
  };
}

export interface DocumentItemProps extends MenuItem {
  isSelected: boolean;
}

export interface IOrderDocument {
  documentSelected: Array<string>;
  studentNo: string;
  selectedSchedule: Date | null;
  deliverOptions: DeliveryOptions | null;
  paymentOptions: PaymentOptions | null;
  address?: string | null;
  additionalAddress?: string | null;
  longitude?: string | number | null;
  latitude?: string | number | null;
}

export interface IRecentSales extends DocumentPayment {
  RequestDocuments: RequestDocuments & {
    users: Users & {
      UserInformation: UserInformation;
    };
  };
}
