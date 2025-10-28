# Security Policy

We take security seriously. This document describes how to securely report
vulnerabilities and what to expect from the response process.

## How to Report

1. **Do not** open a public issue, pull request, or comment describing the vulnerability.
2. Send an email to **[jp.coutm@gmail.com](mailto:jp.coutm@gmail.com)** with the
   subject `SECURITY: <short description>`.
3. Include, whenever possible:

   - Reproducible steps (browsing, sample data, browser/system).
   - Estimated impact (e.g., local data leak, remote execution, DoS).
   - Evidence (captures, logs, videos) and proof-of-concept.
   - Mitigation suggestions or temporary workarounds (optional).

If you prefer an alternative channel (PGP, Matrix, etc.), mention it in the
initial email so we can discuss the best method.

## Timeline

- **Confirmation of receipt:** up to 5 business days.
- **First substantive update:** up to 14 calendar days after receipt.
- **Remediation window:** will be scheduled if the issue is confirmed; we
  prioritize publishing quick fixes.

Once the report is received, we will assess the severity, identify those
responsible, and keep you informed until the issue is fixed or invalidated.

## Scope

The following are in scope:

- Application code (React, TypeScript, assets in `dist/`).
- Local data layer (IndexedDB/localStorage) and import/export processes when
  available.
- PWA workflow (*service worker*, manifest, cache) and build configurations.

The following are out of scope:

- Physical attacks, social engineering, or *phishing* against maintainers and
  users.
- Unmodified third-party dependencies hosted outside of this repository.
- Vulnerabilities that require jailbroken devices or outdated, unsupported
  browsers.
- Spam, brute force, or abuse of third-party resources (e.g., GitHub Actions).

## Version Support

- We only maintain the current version (main / latest release). Update to the
  latest release before validating the fix.
- Unsupported releases may receive patches at the maintainers' discretion.

## Responsible Disclosure

After a fix is released and a stable version is released:

- We will publish a note in the CHANGELOG / Releases describing the impact and
  the solution.
- We will thank the researcher if they accept public acknowledgment.
- We will coordinate disclosure with you before making the details public.

Thank you for helping keep this project secure. Responsible reporting is
essential to protecting the community.
