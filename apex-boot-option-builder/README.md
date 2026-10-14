# Dropzone — Apex Launch Option Builder

Astro + Svelte + TypeScript static site for GitHub Pages. It converts the provided static-registration CSV into searchable data, builds launch argument strings, and ranks curated presets from GA4 `preset_used` events once per day.

## Local development

```sh
npm ci
npm run dev
```

Set `PUBLIC_GA_MEASUREMENT_ID` in `.env` to enable GA4 events. Without it, the builder works and rankings stay empty.

## GA4 setup

1. Publish this project from a repository named exactly `apex-boot-option-builder`. Astro uses the GitHub repository name as the Pages base path, producing `/apex-boot-option-builder/`.
2. Keep `kariya.dev` configured on the account's user site repository. Leave the custom-domain field empty on this project repository; GitHub serves it under `https://kariya.dev/apex-boot-option-builder/`.
3. Create a GA4 web stream and set `PUBLIC_GA_MEASUREMENT_ID` as a GitHub Actions variable (and in `.env` locally).
4. Create an event-scoped custom dimension named `preset_id` for event parameter `preset_id`.
5. Enable the Google Analytics Data API, create a service account, and grant it Viewer access to the property.
6. Add repository secrets `GA4_PROPERTY_ID` and `GOOGLE_SERVICE_ACCOUNT_JSON` (the full service-account JSON).
7. Enable GitHub Pages with GitHub Actions as the build source.

Scheduled ranking covers the latest 30 complete days through two days ago. The ranked metric is unique active users, with event count shown as a secondary measure. Use **使った** to register `preset_used`; copying or loading a preset into the builder does not count as use. Search terms and builder-copy counts are sent to GA4 without sending the generated command.

The CSV contains static registrations, not a verified allowlist of accepted launch arguments. CSV-derived entries are shown as experimental. Curated presets are kept separately in `src/data/presets.json` and cite EA's official FPS-cap guidance.
