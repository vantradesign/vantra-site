<script setup lang="ts">
usePageSeo({
  title: 'Privacy',
  description: 'What this website collects, and what Vantra\u2019s tools collect.',
  breadcrumb: [{ name: 'Privacy', path: '/privacy' }],
})
</script>

<template>
  <div class="gutter pt-16 md:pt-24">
    <p class="caption">Privacy</p>
    <h1 class="mt-8 font-display text-display font-bold max-w-[24ch] text-balance">
      This site collects nothing, and neither do the tools.
    </h1>

    <div class="mt-14 md:grid md:grid-cols-12">
      <div class="md:col-span-8 md:col-start-5 space-y-10">
        <!-- ── Controller (Art. 13(1)(a) GDPR) ──────────────────────── -->
        <section>
          <h2 class="caption">Controller</h2>
          <p class="mt-4 measure text-ink-muted">
            Kai Kauper<br />
            Humboldtstr. 3<br />
            71032 Böblingen<br />
            Germany
          </p>
          <p class="mt-2">
            <AppLink to="mailto:hello@vantra.design">hello@vantra.design</AppLink>
          </p>
          <p class="mt-2 measure text-ink-muted">
            The controller within the meaning of Art. 4(7) GDPR is the natural person named above.
            There is no obligation to appoint a data protection officer.
          </p>
        </section>

        <!-- ── Scope and legal basis ─────────────────────────────────── -->
        <section>
          <h2 class="caption">This website</h2>
          <p class="mt-4 measure text-ink-muted">
            Static pages, served without analytics, tracking pixels, advertising identifiers or
            third-party cookies. Fonts are self-hosted, so no request leaves for a font CDN. The
            site does not set any cookies and does not use any tracking technology.
          </p>
        </section>

        <!-- ── Hosting (Cloudflare Pages) ────────────────────────────── -->
        <section>
          <h2 class="caption">Hosting</h2>
          <p class="mt-4 measure text-ink-muted">
            The site is hosted on Cloudflare Pages, a service of Cloudflare, Inc., 101 Townsend
            Street, San Francisco, CA 94107, USA. When you visit a page, your browser automatically
            transmits certain technical data to Cloudflare's edge servers:
          </p>
          <ul class="mt-3 measure text-ink-muted list-disc pl-5 space-y-1">
            <li>IP address</li>
            <li>Date and time of the request</li>
            <li>URL of the requested page</li>
            <li>Referrer URL (the previously visited page)</li>
            <li>Browser type, version and language</li>
            <li>Operating system</li>
          </ul>
          <p class="mt-3 measure text-ink-muted">
            This data is processed to deliver the page to you and to maintain operational security
            (protection against attacks). It is not used to profile visitors. The legal basis is
            Art. 6(1)(f) GDPR — the legitimate interest of providing a functional and secure
            website.
          </p>
          <p class="mt-3 measure text-ink-muted">
            Cloudflare retains server logs for a limited period (typically up to 72 hours) and
            deletes them automatically thereafter. Cloudflare acts as a processor under a data
            processing agreement that includes the EU standard contractual clauses. Cloudflare is
            also certified under the EU–US Data Privacy Framework.
          </p>
          <p class="mt-3 measure text-ink-muted">
            More information:
            <AppLink to="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy Policy</AppLink>.
          </p>
        </section>

        <!-- ── SSL/TLS encryption ────────────────────────────────────── -->
        <section>
          <h2 class="caption">Encryption</h2>
          <p class="mt-4 measure text-ink-muted">
            This site uses TLS encryption (recognisable by the https:// prefix and the lock icon in
            your browser). When TLS is active, data transmitted between your browser and the server
            cannot be read by third parties.
          </p>
        </section>

        <!-- ── The tools ─────────────────────────────────────────────── -->
        <section>
          <h2 class="caption">The tools</h2>
          <p class="mt-4 measure text-ink-muted">
            Vantra's tools run locally in your browser. Page content, URLs, screenshots, source code
            and findings are not transmitted to us or to anyone else. There is no account and no
            telemetry.
          </p>
          <p class="mt-3 measure text-ink-muted">
            Some tools store settings or progress in your browser's localStorage — for example, the
            maturity check stores your answers so you can resume later. This data never leaves your
            device and is not accessible to us. You can clear it at any time through your browser
            settings.
          </p>
        </section>

        <!-- ── Contact via email ─────────────────────────────────────── -->
        <section>
          <h2 class="caption">Contact via email</h2>
          <p class="mt-4 measure text-ink-muted">
            When you send an email to
            <AppLink to="mailto:hello@vantra.design">hello@vantra.design</AppLink>,
            we process your email address, your name (if provided) and the content of your message.
            Email is routed through Cloudflare Email Routing, a service of Cloudflare, Inc. (see
            Hosting above for address and transfer safeguards).
          </p>
          <p class="mt-3 measure text-ink-muted">
            The legal basis is Art. 6(1)(f) GDPR — the legitimate interest in responding to
            enquiries — or Art. 6(1)(b) GDPR if the contact relates to a contractual matter.
            Your data is stored only as long as needed to handle the enquiry, plus any retention
            period required by law (typically up to six years under German commercial law).
          </p>
        </section>

        <!-- ── No cookies, no analytics ──────────────────────────────── -->
        <section>
          <h2 class="caption">Cookies and analytics</h2>
          <p class="mt-4 measure text-ink-muted">
            This site does not set cookies — not first-party, not third-party. There is no analytics
            service, no conversion tracking and no advertising network. Consequently, no consent
            banner is needed.
          </p>
        </section>

        <!-- ── Third-country transfers ───────────────────────────────── -->
        <section>
          <h2 class="caption">Third-country transfers</h2>
          <p class="mt-4 measure text-ink-muted">
            The only recipient of personal data outside the European Economic Area is Cloudflare,
            Inc. (USA), which hosts the site and routes email. The transfer is safeguarded by
            Cloudflare's certification under the EU–US Data Privacy Framework and by the EU standard
            contractual clauses included in the data processing agreement.
          </p>
        </section>

        <!-- ── Data subject rights (Art. 13(2)(b)–(d) GDPR) ─────────── -->
        <section>
          <h2 class="caption">Your rights</h2>
          <p class="mt-4 measure text-ink-muted">
            Under the GDPR you have the following rights with respect to your personal data.
            To exercise any of them, contact
            <AppLink to="mailto:hello@vantra.design">hello@vantra.design</AppLink>.
          </p>
          <ul class="mt-3 measure text-ink-muted list-disc pl-5 space-y-1">
            <li><strong>Access</strong> (Art. 15) — confirmation of whether data is processed and, if so, a copy of it.</li>
            <li><strong>Rectification</strong> (Art. 16) — correction of inaccurate data without undue delay.</li>
            <li><strong>Erasure</strong> (Art. 17) — deletion of data when it is no longer needed, consent is withdrawn, or processing is unlawful.</li>
            <li><strong>Restriction</strong> (Art. 18) — temporary suspension of processing while accuracy or lawfulness is under review.</li>
            <li><strong>Data portability</strong> (Art. 20) — receipt of your data in a structured, machine-readable format.</li>
            <li><strong>Objection</strong> (Art. 21) — objection to processing based on legitimate interest. Processing will cease unless compelling legitimate grounds override your interests.</li>
          </ul>
        </section>

        <!-- ── Right to lodge a complaint ────────────────────────────── -->
        <section>
          <h2 class="caption">Supervisory authority</h2>
          <p class="mt-4 measure text-ink-muted">
            You have the right to lodge a complaint with a data protection supervisory authority
            (Art. 77 GDPR). The competent authority for the controller is:
          </p>
          <p class="mt-3 measure text-ink-muted">
            Der Landesbeauftragte für den Datenschutz<br />
            und die Informationsfreiheit Baden-Württemberg<br />
            Lautenschlagerstraße 20<br />
            70173 Stuttgart<br />
            <AppLink to="https://www.baden-wuerttemberg.datenschutz.de">www.baden-wuerttemberg.datenschutz.de</AppLink>
          </p>
        </section>

        <!-- ── Automated decision-making ─────────────────────────────── -->
        <section>
          <h2 class="caption">Automated decision-making</h2>
          <p class="mt-4 measure text-ink-muted">
            No automated decision-making or profiling within the meaning of Art. 22 GDPR takes
            place.
          </p>
        </section>

        <!-- ── Changes ───────────────────────────────────────────────── -->
        <section>
          <h2 class="caption">If that changes</h2>
          <p class="mt-4 measure text-ink-muted">
            Should accounts or paid features be introduced, this page will state exactly what is
            stored, where, and for how long — before the feature ships, not after.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
