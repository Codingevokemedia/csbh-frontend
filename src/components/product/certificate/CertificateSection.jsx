import CertificateOfAuthenticity from './CertificateOfAuthenticity';
import { openCertificateInNewTab } from './certificateRows';

export default function CertificateSection({ rows, imageUrl, imageAlt }) {
  const imageForNewTab =
    imageUrl && typeof window !== 'undefined' ? new URL(imageUrl, window.location.origin).href : imageUrl;

  return (
    <div style={{ display: 'grid', gap: 20, textAlign: 'left' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#666', maxWidth: 560 }}>
          The Certificate of Authenticity for this piece. Order ID and signing date are added once it is ordered.
        </p>
        <button
          type="button"
          onClick={() => openCertificateInNewTab({ rows, imageUrl: imageForNewTab, imageAlt })}
          style={{
            padding: '8px 18px',
            border: '1px solid #1a1a1a',
            borderRadius: 999,
            background: '#fff',
            color: '#1a1a1a',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          View Full Certificate ↗
        </button>
      </div>
      <CertificateOfAuthenticity rows={rows} imageUrl={imageUrl} imageAlt={imageAlt} />
    </div>
  );
}
