// src/app/info/page.tsx
import React from "react";
import Heading from "@/components/ui/Heading";

export default function InfoPage() {
  return (
    <main className="px-6 sm:px-10 py-10 max-w-2xl mx-auto text-grey-700 ">
      <Heading level={2} className="mb-4 text-left">
        Terms & Policies
      </Heading>

      <section className="mb-8">
        <h3 className="font-display text-xl mb-2 text-brand-navy">Terms & Conditions</h3>
        <p className="text-sm mb-4">
          By using EchoDeck, you agree to our terms of use. All content provided
          is for educational purposes only. You may not redistribute or sell any
          flashcards without permission. EchoDeck reserves the right to update
          these terms at any time.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="font-display text-xl mb-2 text-brand-navy">Privacy Policy</h3>
        <p className="text-sm mb-4">
          EchoDeck respects your privacy. We store only the information necessary
          to provide you with a seamless study experience: your email address,
          progress data, and encrypted user credentials. We never share your data
          with third parties except to process payments (Stripe). You may request
          a data export or deletion at any time by contacting support.
        </p>
      </section>

      <section className="mb-8">
        <h3 className="font-display text-xl mb-2 text-brand-navy">Refund Policy</h3>
        <p className="text-sm mb-4">
          All purchases are final. If you believe you have been charged in error
          or have encountered a technical issue, please contact us at
          support@echodeck.com within 7 days of purchase. We will review your
          request and work to find a satisfactory resolution.
        </p>
      </section>
    </main>
  );
}