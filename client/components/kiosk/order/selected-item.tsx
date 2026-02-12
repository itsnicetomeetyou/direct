import { useAppDispatch } from '@/hooks/redux';
import { formatCurrency } from '@/lib/utils';
import { removeFromOrder } from '@/store/kiosk/orderSlice';
import { MenuItem } from '@/types';
import { ExternalLink, X } from 'lucide-react';
import { Poppins } from 'next/font/google';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { useState } from 'react';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '600', '900'],
  subsets: ['latin']
});

export default function SelectedItem(item: MenuItem) {
  const dispatch = useAppDispatch();
  const [viewPdf, setViewPdf] = useState(false);

  return (
    <div className="items-center justify-center rounded-2xl bg-blue-600 p-3">
      {viewPdf && (
        <div className="absolute w-3/4">
          <DocViewer
            documents={[
              {
                uri: item.sampleDocs ?? '',
                fileType: 'pdf'
              }
            ]}
            pluginRenderers={DocViewerRenderers}
            className=" absolute"
            theme={{
              primary: '#5296d8',
              secondary: '#ffffff',
              tertiary: '#5296d899',
              textPrimary: '#ffffff',
              textSecondary: '#5296d8',
              textTertiary: '#00000099',
              disableThemeScrollbar: false
            }}
          />
        </div>
      )}
      <div className="flex  justify-end">
        <button onClick={() => setViewPdf(!viewPdf)}>
          {!viewPdf ? (
            <ExternalLink className="rounded-full p-1" size={30} />
          ) : (
            <X className="rounded-full p-1 hover:bg-red-500" size={30} />
          )}
        </button>
        <button onClick={() => dispatch(removeFromOrder(item.id))}>
          <X className="rounded-full p-1 hover:bg-red-500" size={30} />
        </button>
      </div>
      <div className={`mb-5 flex flex-col items-center justify-center`}>
        <span className={`${poppins.className} text-lg font-semibold`}>{item.name}</span>
        <span className={` ${poppins.className}  font-medium text-white/70`}>{formatCurrency(item.price)}</span>
      </div>
    </div>
  );
}
