import { Component, h } from '@stencil/core';

@Component({
  tag: 'newsletter-signup',
  styleUrl: 'newsletter-signup.scss'
})
export class NewsletterSignup {
  render() {
    return (
      <section class="newsletter">
        <div class="container">
          <hgroup>
            <h2>Subscribe to our newsletter</h2>
            <p>The latest Capacitor news and resources sent straight to your inbox.</p>
          </hgroup>
          <form action="https://codiqa.createsend.com/t/t/s/flhuhj/" method="post">
            <div class="input-with-button">
              <input aria-label="Email address" type="email" placeholder="Email address" id="fieldEmail" name="cm-flhuhj-flhuhj" required />
              <button type="submit">Subscribe</button>
            </div>
          </form>
        </div>
      </section>
    );
  }
}
