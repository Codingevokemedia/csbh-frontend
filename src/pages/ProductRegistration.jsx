import { useEffect } from 'react';

// Register Your Watch — embeds the EvokeMedia (LeadConnector) registration form.
// Submitting the form registers the watch directly on EvokeMedia. Their
// form_embed.js script auto-resizes the iframe to the form's content height.
const FORM_ID = '9wwHbGq6jTfTsnXz1ta7';
const REGISTER_FORM_URL = `https://link.evokemedia.io/widget/form/${FORM_ID}?notrack=true`;
const EMBED_SCRIPT_SRC = 'https://link.evokemedia.io/js/form_embed.js';

export default function ProductRegistration() {
  // Load the embed script once so the iframe auto-resizes to fit the form.
  useEffect(() => {
    if (document.querySelector(`script[src="${EMBED_SCRIPT_SRC}"]`)) return;
    const s = document.createElement('script');
    s.src = EMBED_SCRIPT_SRC;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="max-w-[640px] mx-auto px-6 sm:px-10 py-14">
      <h1 className="font-sans text-2xl font-bold text-ink text-center mb-2">Register Your Watch</h1>
      <p className="font-sans text-sm text-steel text-center mb-10">
        Please fill in the information below to register your timepiece:
      </p>

      <iframe
        src={REGISTER_FORM_URL}
        id={`inline-${FORM_ID}`}
        title="Register Your Watch"
        className="w-full border-0 rounded-lg bg-white"
        style={{ minHeight: '600px' }}
        scrolling="no"
        allow="clipboard-write"
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-form-id={FORM_ID}
        data-layout-iframe-id={`inline-${FORM_ID}`}
        data-form-name="Register Your Watch"
      />
    </div>
  );
}
