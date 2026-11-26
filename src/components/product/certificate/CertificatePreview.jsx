import { useEffect, useState } from 'react';
import CertificateOfAuthenticity from './CertificateOfAuthenticity';
import { CERTIFICATE_STORAGE_KEY } from './certificateRows';

const buttonStyle = {
  padding: '8px 18px',
  border: '1px solid #1a1a1a',
  borderRadius: 999,
  background: '#fff',
  color: '#1a1a1a',
  fontSize: 13,
  cursor: 'pointer',
};

export default function CertificatePreview() {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    try {
      setData(JSON.parse(localStorage.getItem(CERTIFICATE_STORAGE_KEY) || 'null'));
    } catch {
      setData(null);
    }
  }, []);

  if (data === undefined) return null;

  return (
    <main style={{ padding: '32px 16px 64px', maxWidth: 1080, margin: '0 auto' }}>
      {data ? (
        <>
          <div className="certificate-preview-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 20 }}>
            <button type="button" style={buttonStyle} onClick={() => window.print()}>Print</button>
            <button type="button" style={buttonStyle} onClick={() => window.close()}>Close</button>
          </div>
          <CertificateOfAuthenticity rows={data.rows} imageUrl={data.imageUrl} imageAlt={data.imageAlt} />
          <style>{'@media print { .certificate-preview-actions { display: none !important; } }'}</style>
        </>
      ) : (
        <p style={{ textAlign: 'center', color: '#666', padding: '80px 0' }}>
          No certificate to show. Open it from a product&apos;s Certificate tab.
        </p>
      )}
    </main>
  );
}
