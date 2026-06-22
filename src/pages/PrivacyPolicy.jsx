const SECTIONS = [
  {
    title: '1. Who We Are',
    body: 'CS Beverly Hills is a luxury timepiece and fine jewelry brand operating through the EVOKE Marketplace platform. Our registered business address is 9876 Wilshire Blvd, Beverly Hills, CA 90210. When you shop with us, your relationship is with CS Beverly Hills and governed by this Privacy Policy.',
  },
  {
    title: '2. Information We Collect',
    body: 'We collect information you provide when you create an account, place an order, register a product, or contact us. This includes your name, email address, phone number, shipping and billing address, and payment method details. We also collect information automatically when you browse our site, including your IP address, browser type, pages visited, referring website, and device information. This helps us improve your experience and understand how our site is used.',
  },
  {
    title: '3. How We Use Your Information',
    body: 'We use your personal information to process and fulfill your orders, send order confirmations and shipping updates, respond to your enquiries and provide customer support, verify product registrations and activate warranties, send marketing communications where you have opted in, and comply with legal and regulatory obligations. We may also analyze aggregated, anonymized data to improve our products and services.',
  },
  {
    title: '4. Sharing With Third Parties',
    body: 'We do not sell, rent, or trade your personal information to third parties for their own marketing purposes. We share your data only with trusted service providers who help us operate our business — including EVOKE Marketplace for order processing, payment processors for secure transactions, and shipping carriers for delivery. All third-party partners are contractually bound to keep your data confidential and use it only for the services they provide to us.',
  },
  {
    title: '5. Cookies and Tracking',
    body: 'Our website uses cookies and similar tracking technologies to keep you signed in, remember your preferences, and understand how visitors interact with our site. Essential cookies are required for the site to function. Analytics cookies help us improve performance. You may disable non-essential cookies through your browser settings, though doing so may affect certain features of the site.',
  },
  {
    title: '6. Data Security',
    body: 'We take the security of your personal information seriously. We use industry-standard SSL encryption for all data transmission, maintain strict access controls so only authorized personnel can access personal data, and regularly review our security practices. No method of online data storage is 100% secure, but we take every reasonable measure to protect your information from unauthorized access, disclosure, or loss.',
  },
  {
    title: '7. Data Retention',
    body: 'We retain your personal information for as long as your account is active, as needed to fulfill our services, and as required by applicable law. Transaction records are typically retained for seven years for tax and accounting purposes. When data is no longer required, it is securely deleted or anonymized.',
  },
  {
    title: '8. Your Rights',
    body: 'Depending on your jurisdiction, you may have the right to access a copy of your personal data, correct inaccurate information, request deletion of your data, opt out of marketing communications, and lodge a complaint with your local data protection authority. To exercise any of these rights, contact us at support@craigshelly.com. We respond to all verified requests within 30 days.',
  },
  {
    title: '9. Children\'s Privacy',
    body: 'Our website and services are not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately and we will promptly delete it.',
  },
  {
    title: '10. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make material changes, we will notify you by email or by posting a prominent notice on our website. The revised policy will include an updated effective date. Continued use of our services after any changes constitutes acceptance of the updated policy.',
  },
  {
    title: '11. Contact Us',
    body: 'If you have questions or concerns about this Privacy Policy or how we handle your personal information, please reach out to us at:\n\nCS Beverly Hills\n9876 Wilshire Blvd\nBeverly Hills, CA 90210\nsupport@craigshelly.com\n562-472-1111',
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="max-w-[860px] mx-auto px-6 sm:px-10 py-12">
      <h1 className="font-sans text-xl font-bold text-ink text-center tracking-wide mb-8">PRIVACY POLICY</h1>

      <p className="font-sans text-sm text-steel leading-relaxed mb-8">
        This Privacy Policy explains how CS Beverly Hills collects, uses, and protects your personal information when
        you visit our website, make a purchase, or interact with our services. We are committed to being transparent
        about our data practices and ensuring your privacy is always protected. By using our site, you agree to the
        terms described below. If you have any questions at any time, please do not hesitate to contact us at{' '}
        <a href="mailto:support@craigshelly.com" className="underline hover:text-ink">support@craigshelly.com</a>.
      </p>

      <div className="flex flex-col gap-8">
        {SECTIONS.map(s => (
          <section key={s.title}>
            <h2 className="font-sans text-[13px] font-bold text-ink mb-2">{s.title}</h2>
            <p className="font-sans text-sm text-steel leading-relaxed whitespace-pre-line">{s.body}</p>
          </section>
        ))}
      </div>

      <p className="font-sans text-xs text-mist mt-10">Last updated: January 1, 2025</p>
    </div>
  );
}
