import React, { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from './pdfGenerator';

const PDFPreviewModal = ({ order, onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl flex flex-col ${isFullScreen ? 'w-full h-full' : 'w-11/12 h-5/6 max-w-5xl'}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Fatura Önizleme</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="text-gray-600 hover:text-gray-800"
              title={isFullScreen ? "Küçült" : "Tam Ekran"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullScreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                )}
              </svg>
            </button>
            <PDFDownloadLink
              document={<InvoicePDF order={order} />}
              fileName={`Siparis_${order.id}.pdf`}
              className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors flex items-center space-x-1"
            >
              {({ blob, url, loading, error }) => (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>{loading ? "Hazırlanıyor..." : "İndir"}</span>
                </>
              )}
            </PDFDownloadLink>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <PDFViewer 
            style={{ width: '100%', height: '100%' }}
            showToolbar={false}
          >
            <InvoicePDF order={order} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;