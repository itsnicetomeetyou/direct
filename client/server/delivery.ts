// 'use server';
// import { Prisma } from '@prisma/client';
// import { prisma } from './prisma';

// interface FetchDeliveryParams {
//   page: number;
//   limit: number;
//   search?: string | null;
// }

// export async function fetchDelivery({ page, limit, search }: FetchDeliveryParams) {
//   const skip = (page - 1) * limit;

//   const deliveryOptions = await prisma.deliveryOptions.findMany({
//     where: {
//       ...(search && { name: { contains: search, mode: 'insensitive' } })
//     },
//     orderBy: { createdAt: 'desc' },
//     skip,
//     take: limit
//   });

//   const totalDeliveryOptions = await prisma.deliveryOptions.count({
//     where: {
//       ...(search && { name: { contains: search, mode: 'insensitive' } })
//     }
//   });

//   return {
//     deliveryOptions,
//     totalDeliveryOptions
//   };
// }

// export async function createDelivery(data: Prisma.DeliveryOptionsCreateInput) {
//   const nameExist = await prisma.deliveryOptions.findFirst({
//     where: { name: data.name }
//   });
//   if (nameExist) throw new Error('Delivery name already exists');
//   const response = await prisma.deliveryOptions.create({ data });
//   return response;
// }

// export async function fetchDeliveryById(deliveryId: string) {
//   const checkDeliveryExist = await prisma.deliveryOptions.findFirst({
//     where: { id: deliveryId }
//   });
//   if (!checkDeliveryExist) throw new Error('Delivery not found');
//   const delivery = await prisma.deliveryOptions.findFirst({
//     where: { id: deliveryId }
//   });
//   return delivery;
// }

// export async function updateDelivery(deliveryId: string, data: Prisma.DeliveryOptionsUpdateInput) {
//   const checkDeliveryExist = await prisma.deliveryOptions.findFirst({
//     where: { id: deliveryId }
//   });
//   if (!checkDeliveryExist) throw new Error('Delivery not found');
//   const response = await prisma.deliveryOptions.update({
//     where: { id: deliveryId },
//     data
//   });
//   return response;
// }

// export async function deleteDelivery(deliveryId: string) {
//   const checkDeliveryExist = await prisma.deliveryOptions.findFirst({
//     where: { id: deliveryId }
//   });
//   if (!checkDeliveryExist) throw new Error('Delivery not found');
//   const response = await prisma.deliveryOptions.delete({
//     where: { id: deliveryId }
//   });
//   return response;
// }
