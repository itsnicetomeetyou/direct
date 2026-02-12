import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import { IRecentSales } from '@/types';

export function RecentSales(props: { data: Array<IRecentSales> }) {
  return (
    <div className="space-y-8">
      {props.data.map((item, index) => (
        <div className="flex items-center" key={index}>
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback>
              {item?.RequestDocuments?.users?.UserInformation?.firstName?.charAt(0)}
              {item?.RequestDocuments?.users?.UserInformation?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {item?.RequestDocuments?.users?.UserInformation?.firstName ?? 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">{item?.RequestDocuments?.users?.email ?? 'N/A'}</p>
          </div>
          <div className="ml-auto font-medium">{formatCurrency(Number(item.totalAmount) || 0)}</div>
        </div>
      ))}
    </div>
  );
}
