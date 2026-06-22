const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using the CS Beverly Hills website, placing an order, or engaging with any of our services, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website or services. We reserve the right to update these terms at any time, and your continued use of our services constitutes acceptance of any changes.',
  },
  {
    title: '2. Products and Availability',
    body: 'All products listed on our website are subject to availability. We make every effort to ensure product descriptions, images, and pricing are accurate. However, errors may occasionally occur. In the event of a pricing error or stock discrepancy, we will contact you before processing your order and provide the option to proceed at the correct price or cancel without charge. We reserve the right to limit quantities, refuse orders, or discontinue products at our discretion.',
  },
  {
    title: '3. Pricing and Payment',
    body: 'All prices are listed in US Dollars and are exclusive of any applicable taxes or duties, which will be calculated at checkout. We accept major credit and debit cards as well as any payment methods available through EVOKE Marketplace. By submitting your payment information, you represent that you are authorized to use the payment method provided. All transactions are processed securely and encrypted.',
  },
  {
    title: '4. Orders and Fulfillment',
    body: 'An order confirmation email does not constitute acceptance of your order. We reserve the right to refuse or cancel any order at any time, including after confirmation, for reasons including but not limited to product unavailability, suspected fraud, or inaccuracies in pricing. Fulfillment times are estimates only and may vary. We are not liable for delays caused by carriers, customs, or circumstances beyond our control.',
  },
  {
    title: '5. Shipping and Delivery',
    body: 'We offer complimentary shipping on all orders within the United States. International shipping is available to select destinations and may incur additional fees. Risk of loss and title to products passes to you upon delivery to the carrier. Delivery timeframes provided are estimates only. CS Beverly Hills is not responsible for delays, losses, or damages incurred during transit once the package has been handed to the carrier.',
  },
  {
    title: '6. Returns and Exchanges',
    body: 'We accept returns within 30 days of delivery on items that are unworn, in original condition, and include all original packaging, documentation, and accessories. Items marked as final sale, custom orders, and limited-edition pieces are not eligible for return. To initiate a return, contact our concierge team at support@craigshelly.com. Refunds are processed to the original payment method within 10 business days of receiving and inspecting the returned item.',
  },
  {
    title: '7. Warranty',
    body: 'All CS Beverly Hills timepieces are covered by a limited manufacturer warranty for a period of two years from the original date of purchase. This warranty covers defects in materials and workmanship under normal use. It does not cover damage caused by accidents, misuse, water damage beyond the stated rating, unauthorized modifications, or normal wear and tear. To make a warranty claim, register your product on our website and contact our concierge team.',
  },
  {
    title: '8. Intellectual Property',
    body: 'All content on the CS Beverly Hills website — including but not limited to images, graphics, logos, text, and design elements — is the exclusive property of CS Beverly Hills or its licensors and is protected by applicable copyright and trademark laws. You may not reproduce, copy, distribute, publish, or use any content from this site without our prior written consent.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'To the fullest extent permitted by applicable law, CS Beverly Hills shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use our website or services, even if we have been advised of the possibility of such damages. Our total liability in connection with any order shall not exceed the amount paid for that order.',
  },
  {
    title: '10. Governing Law',
    body: 'These Terms and Conditions are governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles. Any disputes arising out of or relating to these terms or your use of our services shall be subject to the exclusive jurisdiction of the state and federal courts located in Los Angeles County, California.',
  },
  {
    title: '11. Contact',
    body: 'If you have any questions about these Terms and Conditions, please contact us at:\n\nCS Beverly Hills\n9876 Wilshire Blvd\nBeverly Hills, CA 90210\nsupport@craigshelly.com\n562-472-1111',
  },
];

export default function Terms() {
  return (
    <div className="max-w-[860px] mx-auto px-6 sm:px-10 py-12">
      <h1 className="font-sans text-xl font-bold text-ink text-center tracking-wide mb-4">TERMS &amp; CONDITIONS</h1>

      {/* Big bold statement matching reference design */}
      <p className="font-sans text-base font-bold text-ink leading-snug mb-2">
        OUR PRINCIPAL OBJECTIVE IS TO ENSURE EVERY CS BEVERLY HILLS CLIENT RECEIVES AN EXCEPTIONAL EXPERIENCE,
        UNMATCHED QUALITY, AND COMPLETE SATISFACTION WITH EVERY PURCHASE.
      </p>
      <p className="font-sans text-sm text-steel leading-relaxed mb-8">
        We warmly welcome your feedback, questions, and suggestions regarding your experience with CS Beverly Hills.
        Return Process: 7-Day Return Policy.
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
