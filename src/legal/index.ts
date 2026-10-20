import { APP_VERSION, SUPPORT_EMAIL } from '../config';

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

/** One date for both documents. Change it whenever either text changes. */
export const LEGAL_UPDATED = '20 October 2026';

export const PRIVACY: LegalDoc = {
  title: 'Privacy Policy',
  updated: LEGAL_UPDATED,
  intro:
    'Brokey is a personal money tool. This policy explains what the app does with your information. The short version: your buys stay on your phone, and there are no ads, no trackers and no analytics in this version.',
  sections: [
    {
      heading: 'What Brokey stores',
      body: [
        'Everything you enter: purchases, amounts, categories, notes, wallets, budgets, wishes, shame shelf items, regret answers and your settings. This is stored on your device only.',
        'If you delete the app, or use Reset everything in Settings, this data is removed from your device.',
      ],
    },
    {
      heading: 'What Brokey does not do',
      body: [
        'It does not connect to your bank. It does not read your messages, contacts, photos or location. It does not include advertising or analytics code, and it does not sell or share your information.',
        'If you set up the Apple Pay shortcut, the amount and shop name come from your own iPhone through the Shortcuts app and open Brokey on your device. They are not sent to us.',
      ],
    },
    {
      heading: 'Notifications',
      body: [
        'If you allow notifications, Brokey schedules reminders on your device (for example when a cooling-off timer finishes). These are local notifications. They are not sent from a server, and Brokey does not collect a push token.',
      ],
    },
    {
      heading: 'Exports and sharing',
      body: [
        'When you export a spreadsheet, a PDF report or an HSP receipt, Brokey creates a file on your device and opens the share sheet. Where it goes next is up to you and the app you choose.',
      ],
    },
    {
      heading: 'Accounts (if you sign in)',
      body: [
        'Accounts are optional and may not be available in your version. If you create one, we store your email address and the data you choose to sync so it can appear on your other devices. This is hosted by our database provider, Supabase.',
        'You can delete your account in the app at any time (Settings, Account). That removes your account and synced data from our servers.',
      ],
    },
    {
      heading: 'Children',
      body: ['Brokey is not designed for children under 13 and we do not knowingly collect information from them. The Unhinged roast level is for adults only and asks you to confirm you are 18 or older.'],
    },
    {
      heading: 'Your choices',
      body: ['You can export your data, edit or delete any purchase, reset the app, turn notifications off in your phone settings, and delete your account if you have one.'],
    },
    {
      heading: 'Changes',
      body: ['If this policy changes in a way that matters, we will update the date above and tell you in the app.'],
    },
    {
      heading: 'Contact',
      body: [`Questions? Email ${SUPPORT_EMAIL}.`],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: 'Terms of Use',
  updated: LEGAL_UPDATED,
  intro: `These terms cover your use of Brokey (version ${APP_VERSION}). By using the app you agree to them. If you do not agree, please do not use it.`,
  sections: [
    {
      heading: 'What Brokey is',
      body: [
        'Brokey is an entertainment-flavoured tool that helps you notice and think about your spending. It works from the information you type in.',
        'Brokey is not a bank, a financial adviser or an accountant. Nothing in the app is financial, legal or tax advice. You are responsible for your own money decisions.',
      ],
    },
    {
      heading: 'The humour',
      body: [
        'Brokey jokes about your purchases. The jokes are written to be playful and never to be about your body, identity or worth. If a line does not land, you can turn the roast level down in Settings or report it to us.',
        'The Unhinged level uses ruder language and is for adults only. Choosing it means you are 18 or older.',
      ],
    },
    {
      heading: 'Your data and your responsibility',
      body: [
        'You own what you enter. Keep your own backup with Export if the data matters to you. We cannot recover data from a phone that has been lost or reset unless you use sync, when it is offered.',
        'Amounts and totals depend on what you log. Brokey does not check them against any bank.',
      ],
    },
    {
      heading: 'Acceptable use',
      body: ['Do not misuse the app, try to break it, or use it to harass anyone. If shared features arrive in a future version, content you share must be lawful and respectful, and we may remove content or accounts that are not.'],
    },
    {
      heading: 'No warranty',
      body: ['The app is provided as it is. We do our best, but we do not promise it will be error free, always available, or fit for a particular purpose.'],
    },
    {
      heading: 'Limit of liability',
      body: ['To the extent the law allows, we are not liable for loss arising from your use of the app, including decisions you make based on it. Nothing here limits rights you have under consumer law that cannot be excluded.'],
    },
    {
      heading: 'Changes and ending',
      body: ['We may update the app and these terms. If you keep using Brokey after an update, you accept the new terms. You can stop using the app at any time by deleting it.'],
    },
    {
      heading: 'Governing law',
      body: ['These terms are governed by the laws of Victoria, Australia.'],
    },
    {
      heading: 'Contact',
      body: [`Email ${SUPPORT_EMAIL}.`],
    },
  ],
};
