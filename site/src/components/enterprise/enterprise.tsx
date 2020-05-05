import { Component } from '@stencil/core';

declare var window: any;

@Component({
  tag: 'capacitor-enterprise',
  styleUrl: 'enterprise.scss'
})
export class Enterprise {
  componentDidLoad() {
    const hbsScript = document.createElement('script');
    hbsScript.src = '//js.hsforms.net/forms/v2.js';
    hbsScript.type = 'text/javascript';
    hbsScript.charset = 'utf-8';
    hbsScript.addEventListener('load', () => {
      window.hbspt.forms.create({
        portalId: '3776657',
        formId: 'd0019a78-110e-4d28-b356-56357b4abe4b',
        target: '#scripts',
        css: ''
      });
    });
    document.body.appendChild(hbsScript);
    // el.appendChild(hbsScript);
  }

  render() {
    return (
      <div class="enterprise">
        <div class="cta">
          <div class="container">
            <h1>Capacitor for Enterprises</h1>
            <p>
              Powerful solution for mission-critical enterprise
              apps
              <br />
              across consumer and employee-facing<br />
              iOS, Android, and Progressive Web Apps.
            </p>
            <a href="#contact" class="btn">
              Learn more
            </a>
          </div>
        </div>
        <section class="section">
          <div class="container">
            <hgroup>
              <h2>Enterprise mobile development, made easy</h2>
              <p>
                Meet your development goals with premium software and services
                that accelerate development and reduce project risk.
              </p>
            </hgroup>
            <div class="points">
              <div class="point">
                <h3>Build with confidence</h3>
                <p>
                  Enjoy peace of mind knowing the native plugins you
                  depend on are built and maintained by a team you can trust,
                  and backed by mission-critical support and expert services.
                </p>
              </div>
              <div class="point">
                <h3>Protect your users &amp; data</h3>
                <p>
                  Give your users the best possible mobile security,
                  with advanced biometric authentication, SSO integration,
                  and the latest in secure encrypted storage.
                </p>
              </div>
              <div class="point">
                <h3>Accelerate your mobile projects</h3>
                <p>
                  Save valuable time and effort that would normally
                  be spent chasing plugins and building from scratch.
                  Capacitor Enterprise delivers everything you need on Day 1.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="highlights">
          <div class="container">
            <div class="highlight">
              <h2>World-class support</h2>
              <p>
                Get guaranteed response SLAs through the app lifecycle. Ionic's professional support team is on-hand to help you troubleshoot and address issues occurring at the native layer.
              </p>
            </div>
            <div class="highlight">
              <h2>Stable, secure plugin library</h2>
              <p>
                Native features maintained by our team of native experts. Active subscribers get ongoing updates to supported plugins, to keep pace with OS and API changes, and evolving devices.
              </p>
            </div>
            <div class="highlight">
              <h2>Pre-built solutions</h2>
              <p>
                Accelerate development with pre-built native solutions to common mobile use cases, like biometrics, authentication, and encrypted offline storage. Built by mobile experts. Deployed in minutes.
              </p>
            </div>
            <div class="highlight">
              <h2>Expert help &amp; guidance</h2>
              <p>
                Our team of native experts will work with you to define a native strategy that fits your unique goals and challenges. From architectural reviews to performance &amp; security audits.
              </p>
            </div>
          </div>
        </section>
        <section id="key-features">
          <div class="container">
            <hgroup>
              <h2>Key features</h2>
              <p>
                Premium software and services to help you reach your development goals
              </p>
            </hgroup>
            <div class="points">
              <div class="point">
                <h3>Core Device Plugins</h3>
                <p>
                  Everything you need to deliver the core functionality your users expect,
                  from essentials like camera and geolocation,
                  to payments and security.
                </p>
              </div>
              <div class="point">
                <h3>Biometrics Sign-in</h3>
                <p>
                  Add a critical layer of protection
                  width advanced biometrics that locks
                  down sensitive data, by employing the latest in native security best practices.
                </p>
              </div>
              <div class="point">
                <h3>Auth Integration</h3>
                <p>
                  Easily connect through existing authentication providers, including Auth0, Azure Active Directory, and AWS Cognito--from any mobile device.
                </p>
              </div>
              <div class="point">
                <h3>Secure Offline Storage</h3>
                <p>
                  Deliver secure, offline-first mobile experiences with a flexible mobile storage solution that uses military-grade encryption to prevent unwanted access and secure user data.
                </p>
              </div>
              <div class="point">
                <h3>Guaranteed SLA</h3>
                <p>
                  Timely support and troubleshooting when you need it most. Get expert help directly from our team with guaranteed response times.
                </p>
              </div>
              <div class="point">
                <h3>Guidance &amp; Expertise</h3>
                <p>
                  Ensure your team is utilizing best practices when adding native functionality, helping you meet your deadlines while avoiding costly tech debt.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div class="container">
            <hgroup>
              <h2>Use Cases</h2>
            </hgroup>
            <div>
              <h3>Mission-critical projects</h3>
              <p>
                When your brand and company reputation are on the line, you need a solution that will work on Day 1. Capacitor Enterprise is a great fit for teams building mission-critical projects who want to minimize project risk and reach their goals.
              </p>
            </div>
            <div>
              <h3>Highly secure apps</h3>
              <p>
                Handling sensitive user or company data? Protect what matters most with advanced mobile security solutions that take advantage of the latest in native security best practices--from biometrics to military-grade encryption.
              </p>
            </div>
            <div>
              <h3>Accelerated timeline</h3>
              <p>
                Facing an aggressive release timeline? We can help. Our pre-built solutions will save you weeks or months of coding from scratch, while our native mobile experts can help you find ways to speed up development and better reach your goals.
              </p>
            </div>
          </div>
        </section>
        <section id="contact">
          <div class="container">
            <hgroup>
              <h2>Learn more</h2>
              <p>
                Fill out form below to receive more information on Capacitor Enterprise.
              </p>
            </hgroup>
          </div>
          <div id="scripts" class="hubspot-override" />
        </section>
      </div>
    )
  }
}