import { DriveStep } from "driver.js";

// Centralized tour step configuration
// To add/edit steps: modify this array. Each step needs an element selector and popover content.

export const indexPageTourSteps: DriveStep[] = [
  {
    element: 'header',
    popover: {
      title: 'Welcome to Certificate Generator! 🎉',
      description: 'This quick tour will show you around. You can skip anytime or restart from the Help menu.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="position-controls"]',
    popover: {
      title: 'Position Controls',
      description: 'Use these controls to precisely position the recipient name on your certificate. Adjust X/Y coordinates and anchor mode.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="certificate-preview"]',
    popover: {
      title: 'Certificate Preview',
      description: 'See your certificate in real-time. The name position updates as you make changes.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="control-panel"]',
    popover: {
      title: 'Style & Generate',
      description: 'Upload your template, customize fonts and colors, then generate certificates for all recipients.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="tabs"]',
    popover: {
      title: 'Switch Views',
      description: 'Toggle between the Editor and Recipients tabs to manage your certificate list.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    popover: {
      title: 'You\'re All Set! 🚀',
      description: 'Start by uploading a certificate template. Need help? Click "Take a Tour" in the header anytime.',
    },
  },
];

export const adminPageTourSteps: DriveStep[] = [
  {
    element: '[data-tour="admin-upload"]',
    popover: {
      title: 'Upload Certificate Template',
      description: 'Select your certificate image file to upload. Supported formats: PNG, JPG, JPEG.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="public-id"]',
    popover: {
      title: 'Set Public ID',
      description: 'Enter a unique identifier for your certificate. This ID will be shared with participants.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="admin-submit"]',
    popover: {
      title: 'Upload & Share',
      description: 'Once uploaded, you\'ll get a shareable link to send to participants.',
      side: 'top',
      align: 'center',
    },
  },
];

export const participantPageTourSteps: DriveStep[] = [
  {
    element: '[data-tour="certificate-id-input"]',
    popover: {
      title: 'Enter Certificate ID',
      description: 'Paste the certificate ID you received from the event organizer.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="retrieve-btn"]',
    popover: {
      title: 'Retrieve Template',
      description: 'Click to load your certificate template and start customizing.',
      side: 'left',
      align: 'center',
    },
  },
];

export const TOUR_STORAGE_KEYS = {
  index: 'tour_completed_index',
  admin: 'tour_completed_admin',
  participant: 'tour_completed_participant',
} as const;
