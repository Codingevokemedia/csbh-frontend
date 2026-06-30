import { useState } from 'react';

// One label/value row — caller decides whether to render it, so empty fields
// are simply never passed in (the spec requires hiding blanks, not labelling them).
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-6 py-3 border-b border-cloud last:border-0">
      <span className="font-sans text-[11px] tracking-widest uppercase text-mist shrink-0">{label}</span>
      <span className="font-sans text-[13px] text-ink text-right break-words">{value}</span>
    </div>
  );
}

const isVideoUrl = (url) => /\.(mp4|webm|mov|ogg|m4v)(\?|#|$)/i.test(String(url || ''));

export default function ProductTabs({ product, shipping, returns }) {
  const [activeTab, setActiveTab] = useState("About product");
  const tabs = [
    "About product",
    "Item details",
    "Certificate",
    "Reviews",
    "Disclaimer",
    "Return policy",
  ];

  const leftDisplayMedia = product.leftDisplayMedia;
  const videos = (Array.isArray(product.videos) ? product.videos : [])
    .filter(v => v !== leftDisplayMedia);

  // Dynamic spec rows: the category attributes plus commerce fields. Anything
  // missing on the backend is filtered out so no blank labels render.
  const attributeRows = Array.isArray(product.attributes) ? product.attributes : [];
  const stockLabel =
    product.stockQuantity != null && product.stockQuantity > 0
      ? `In stock (${product.stockQuantity})`
      : product.inStock ? 'In stock' : 'Out of stock';
  const commerceRows = [
    { label: 'SKU',          value: product.sku },
    { label: 'Product Type', value: product.categoryName || product.category },
    { label: 'Brand',        value: product.brand },
    { label: 'Condition',    value: product.condition },
    { label: 'Origin',       value: product.countryOrigin },
    { label: 'Warranty',     value: product.warranty },
    { label: 'Availability', value: stockLabel },
  ].filter((r) => r.value != null && String(r.value).trim() !== '' && String(r.value).toLowerCase() !== 'notspecified');
  const hasDetails = attributeRows.length > 0 || commerceRows.length > 0;

  const renderContent = () => {
    switch (activeTab) {
      case "About product":
        return (
          <div className="tab-content">
            <h3 className="text-xl sm:text-2xl font-sans font-bold uppercase tracking-tight mb-6 text-ink">{product.aboutTitle || product.title}</h3>
            <p className="font-sans text-sm sm:text-base text-steel leading-relaxed whitespace-pre-line break-words">{product.aboutDescription || product.description}</p>
            
            {leftDisplayMedia && (
              <div className="mt-10 flex justify-center">
                {isVideoUrl(leftDisplayMedia) ? (
                  <video
                    src={leftDisplayMedia}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-w-3xl rounded-xl border border-cloud bg-black aspect-video"
                  />
                ) : (
                  <img
                    src={leftDisplayMedia}
                    alt={product.title}
                    className="w-auto max-w-full sm:max-w-2xl max-h-[600px] object-contain rounded-xl border border-cloud shadow-sm"
                  />
                )}
              </div>
            )}

            {/* Product video(s) from the backend page-builder media. */}
            {videos.length > 0 && (
              <div className="mt-10 flex flex-col items-center gap-10">
                {videos.map((src, i) => (
                  <video
                    key={i}
                    src={src}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-w-3xl rounded-xl border border-cloud bg-black aspect-video"
                  />
                ))}
              </div>
            )}
          </div>
        );
      case "Item details":
        return (
          <div className="tab-content border border-cloud rounded-xl p-8 sm:p-10 bg-white max-w-4xl">
            <h3 className="font-display text-3xl mb-8 text-ink font-light">Product Details</h3>
            {product.description && (
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-5 items-start mb-8 pb-8 border-b border-cloud">
                <span className="text-[11px] tracking-widest uppercase text-mist font-sans">Description</span>
                <p className="font-sans text-sm text-steel leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}
            {hasDetails ? (
              <div className="grid sm:grid-cols-2 sm:gap-x-12">
                {/* Specifications (dynamic attributes) */}
                {attributeRows.map((a) => (
                  <DetailRow key={`attr-${a.name}`} label={a.name} value={a.value} />
                ))}
                {/* Commerce / catalogue fields */}
                {commerceRows.map((r) => (
                  <DetailRow key={`com-${r.label}`} label={r.label} value={r.value} />
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-mist italic font-sans py-4 tracking-wide">
                Detailed specifications are currently being updated for this timepiece.
              </p>
            )}
          </div>
        );
      case "Certificate": {
        const coaImage = product.coaImage || product.raw?.ProductCOAImage || product.image;
        return (
          <div className="tab-content flex justify-center py-10">
            <div className="relative group cursor-crosshair">
                <img 
                    src={coaImage} 
                    alt="Authenticity Certificate" 
                    className="w-[550px] rounded-xl border border-cloud shadow-sm transition-all duration-300 group-hover:blur-[2px] group-hover:grayscale-[20%] group-hover:opacity-70"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-500 pointer-events-none z-10 bg-white p-5 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] w-[700px] max-w-[85vw]">
                    <img src={coaImage} alt="Certificate Enlarged" className="w-full rounded-xl" />
                </div>
            </div>
          </div>
        );
      }
      case "Reviews":
        return (
          <div className="tab-content text-center py-12">
            <h3 className="font-display text-3xl mb-4 text-ink font-light">Customer Reviews</h3>
            <p className="text-mist italic font-sans text-sm">No reviews yet. Be the first to share your experience.</p>
          </div>
        );
      case "Disclaimer":
        return (
          <div className="tab-content border border-cloud rounded-xl p-6 sm:p-10 bg-white max-w-4xl">
            <h3 className="font-display text-3xl mb-8 text-ink font-light">Product Disclaimer</h3>
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-5 items-start">
                    <span className="text-[11px] tracking-widest uppercase text-mist font-sans">Disclaimer</span>
                    <p className="font-sans text-sm text-steel leading-relaxed whitespace-pre-line">
                        {product.disclaimer ||
                          'CS Beverly Hills timepieces are crafted with precision. While we strive for accuracy, slight variations in materials and appearance may occur. All items are subject to availability.'}
                    </p>
                </div>
            </div>
          </div>
        );
      case "Return policy":
        return (
          <div className="tab-content max-w-4xl">
             <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-[#e6f4ea] text-[#34a853] flex items-center justify-center font-bold text-[10px]">✓</span>
                    <span className="text-steel font-sans text-sm tracking-wide">Returns are <b className="font-semibold text-ink">accepted</b></span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-[#e6f4ea] text-[#34a853] flex items-center justify-center font-bold text-[10px]">✓</span>
                    <span className="text-steel font-sans text-sm tracking-wide">Exchanges are <b className="font-semibold text-ink">accepted</b></span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold text-[10px]">i</span>
                    <span className="text-steel font-sans text-sm tracking-wide">Return window: <b className="font-semibold text-ink">30 days</b></span>
                </div>
                
                <div className="mt-8 space-y-8">
                    <div className="border-t border-cloud pt-8">
                        <h4 className="font-sans text-[10px] tracking-widest uppercase text-mist mb-3">Warranty & Returns</h4>
                        <div className="font-sans text-sm text-steel leading-relaxed">{returns}</div>
                    </div>
                    <div className="border-t border-cloud pt-8">
                        <h4 className="font-sans text-[10px] tracking-widest uppercase text-mist mb-3">Shipping Information</h4>
                        <div className="font-sans text-sm text-steel leading-relaxed">{shipping}</div>
                    </div>
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="mt-20 border-t border-cloud">
      <div className="border-b border-cloud">
        <div className="max-w-[1200px] 2xl:max-w-[1400px] mx-auto flex justify-start lg:justify-center gap-6 sm:gap-10 lg:gap-12 px-6 sm:px-12 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t}
              className={`shrink-0 py-6 sm:py-8 text-[13px] sm:text-[15px] font-sans transition-all duration-300 cursor-pointer ${
                activeTab === t ? 'text-ink font-semibold border-b-2 border-ink' : 'text-mist hover:text-ink'
              }`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-[1200px] 2xl:max-w-[1400px] mx-auto py-10 sm:py-12 px-6 sm:px-12">
        <div className="animate-fadeIn">
          {renderContent()}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
}
