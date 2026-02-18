import { NavItem } from '@/types';
import {
  EligibilityStatus,
  RequestDocuments,
  DeliveryOptions,
  DocumentPayment,
  Users,
  DocumentSelected,
  UserInformation,
  Documents
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export type User = {
  id: number;
  name: string;
  company: string;
  role: string;
  verified: boolean;
  status: string;
};
export const users: User[] = [
  {
    id: 1,
    name: 'Candice Schiner',
    company: 'Dell',
    role: 'Frontend Developer',
    verified: false,
    status: 'Active'
  },
  {
    id: 2,
    name: 'John Doe',
    company: 'TechCorp',
    role: 'Backend Developer',
    verified: true,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Alice Johnson',
    company: 'WebTech',
    role: 'UI Designer',
    verified: true,
    status: 'Active'
  },
  {
    id: 4,
    name: 'David Smith',
    company: 'Innovate Inc.',
    role: 'Fullstack Developer',
    verified: false,
    status: 'Inactive'
  },
  {
    id: 5,
    name: 'Emma Wilson',
    company: 'TechGuru',
    role: 'Product Manager',
    verified: true,
    status: 'Active'
  },
  {
    id: 6,
    name: 'James Brown',
    company: 'CodeGenius',
    role: 'QA Engineer',
    verified: false,
    status: 'Active'
  },
  {
    id: 7,
    name: 'Laura White',
    company: 'SoftWorks',
    role: 'UX Designer',
    verified: true,
    status: 'Active'
  },
  {
    id: 8,
    name: 'Michael Lee',
    company: 'DevCraft',
    role: 'DevOps Engineer',
    verified: false,
    status: 'Active'
  },
  {
    id: 9,
    name: 'Olivia Green',
    company: 'WebSolutions',
    role: 'Frontend Developer',
    verified: true,
    status: 'Active'
  },
  {
    id: 10,
    name: 'Robert Taylor',
    company: 'DataTech',
    role: 'Data Analyst',
    verified: false,
    status: 'Active'
  }
];

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};

export type Document = {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  eligibility: EligibilityStatus;
  dayBeforeRelease: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  sampleDocs: string | null;
};

export type Payment = {
  id: string;
  name: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Delivery = {
  id: string;
  name: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

export type TDocumentRequest = RequestDocuments & {
  documentPayment: DocumentPayment;
  users: Users & {
    UserInformation: UserInformation;
  };
  DocumentSelected: Array<DocumentSelected & { document: Documents }>;
};

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: 'Transaction List',
    href: '/dashboard/documents',
    icon: 'billing',
    label: 'transaction-list'
  },
  {
    title: 'Order List',
    href: '/dashboard/request',
    icon: 'post',
    label: 'order-list'
  },
  {
    title: 'Settings',
    icon: 'settings',
    label: 'settings',
    children: [
      {
        title: 'Payment Options',
        href: '/dashboard/settings/payment-options',
        icon: 'billing',
        label: 'payment-options'
      },
      {
        title: 'Shipping Options',
        href: '/dashboard/settings/shipping-options',
        icon: 'product',
        label: 'shipping-options'
      },
      {
        title: 'Schedule Options',
        href: '/dashboard/settings/schedule-options',
        icon: 'page',
        label: 'schedule-options'
      },
      {
        title: 'User Management',
        href: '/dashboard/settings/user-management',
        icon: 'user',
        label: 'user-management'
      },
      {
        title: 'Order Status',
        href: '/dashboard/settings/order-status',
        icon: 'page',
        label: 'order-status'
      },
      {
        title: 'Email Templates',
        href: '/dashboard/settings/email-templates',
        icon: 'mail',
        label: 'email-templates'
      },
      {
        title: 'Roles Management',
        href: '/dashboard/settings/roles-management',
        icon: 'settings',
        label: 'roles-management'
      }
    ]
  }
];
