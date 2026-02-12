import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Xendit } from 'xendit-node';
import { CreateInvoiceRequest, Invoice } from 'xendit-node/invoice/models';

@Injectable()
export class XenditService {
  private readonly xenditClient: Xendit;
  private readonly logger = new Logger(XenditService.name);

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('XENDIT_SECRET_KEY');
    if (!secretKey) throw new Error('Xendit secret key is not provided');
    this.xenditClient = new Xendit({
      secretKey,
    });
    this.logger.log('Xendit client initialized successfully');
  }

  async createInvoice(data: CreateInvoiceRequest) {
    return this.xenditClient.Invoice.createInvoice({
      data: data,
    });
  }

  async getInvoice(id: string): Promise<Invoice> {
    return await this.xenditClient.Invoice.getInvoiceById({
      invoiceId: id,
    });
  }
}
