import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../../src/roles/roles.decorator';
import { RolesGuard } from '../../../src/roles/roles.guard';
import { DocumentService } from './document.service';
import { UserAuth } from '../../../typings';
import { IOrderDocument } from './dto/create.document.dto';
import { CheckQuotation } from './dto/check-quotation.dto';
import { CreateOrder } from '../../../src/logistics/lalamove/dto/lalamove.dto';

@Controller('dashboard/document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Get('list')
  findManyDocuments(@Req() { user }: { user: UserAuth }) {
    return this.documentService.findManyDocuments(user);
  }

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Get('delivery')
  findManyDeliveryOptions() {
    return this.documentService.findManyDeliveryOptions();
  }

  // @Roles(Role.STUDENT)
  // @UseGuards(RolesGuard)
  // @Get('payment')
  // findManyPaymentOptions() {
  //   return this.documentService.findManyPaymentOptions();
  // }

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Post()
  createDocument(
    @Req() { user }: { user: UserAuth },
    @Body() data: IOrderDocument,
  ) {
    return this.documentService.createDocument(user, data);
  }

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Get('transaction')
  findManyDocumentTransaction(@Req() { user }: { user: UserAuth }) {
    return this.documentService.findManyDocumentTransaction(user);
  }

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Get('transaction/:id')
  findOneDocumentTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() { user }: { user: UserAuth },
  ) {
    return this.documentService.findOneDocumentTransaction(id, user);
  }

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Put('transaction/:id')
  payDocumentRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() { user }: { user: UserAuth },
  ) {
    return this.documentService.payDocumentRequest(id, user);
  }

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Post(':id/cancel')
  cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() { user }: { user: UserAuth },
  ) {
    console.log('TEST');
    return this.documentService.cancelOrder(id, user);
  }

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Post('quotation')
  checkQuotation(@Body() data: CheckQuotation) {
    return this.documentService.checkQuotation(data);
  }

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Post('order/:id')
  placeOrder(
    @Body()
    data: {
      quotationId: CreateOrder['quotationId'];
      senderStopId: CreateOrder['senderStopId'];
      recipientStopId: CreateOrder['recipientStopId'];
      recipientPhoneNumber: CreateOrder['recipientPhoneNumber'];
      recipientName: CreateOrder['recipientName'];
      recipientRemarks: CreateOrder['recipientRemarks'];
    },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.documentService.placeOrder(id, data);
  }

  @Roles(Role.STUDENT)
  @UseGuards(RolesGuard)
  @Get('order/:id')
  retrieveOrder(@Param('id') id: string) {
    return this.documentService.retrieveOrder(id);
  }
}
