import { DriveStep } from "driver.js";

// Centralized tour step configuration
// Each step MUST have an 'element' selector to anchor the tooltip
// The tour will automatically scroll to and spotlight each element

export const indexPageTourSteps: DriveStep[] = [
	{
		element: '[data-tour="tabs"]',
		popover: {
			title: "Welcome! 👋",
			description:
				"Let me show you around. This quick tour will help you get started.",
			side: "bottom",
			align: "start",
		},
	},
	{
		element: '[data-tour="position-controls"]',
		popover: {
			title: "Position Controls",
			description:
				"Adjust where the recipient name appears on your certificate. Use the arrow buttons or enter exact X/Y coordinates.",
			side: "right",
			align: "start",
		},
	},
	{
		element: '[data-tour="certificate-preview"]',
		popover: {
			title: "Live Preview",
			description:
				"See your certificate update in real-time as you make changes. The name position is shown exactly as it will appear.",
			side: "left",
			align: "center",
		},
	},
	{
		element: '[data-tour="control-panel"]',
		popover: {
			title: "Styling & Actions",
			description:
				"Upload templates, customize fonts, colors, and sizes. When ready, generate certificates for all your recipients.",
			side: "left",
			align: "start",
		},
	},
	{
		element: '[data-tour="share-button"]',
		popover: {
			title: "Share Template",
			description:
				"Create a shareable link for this design. Recipients can open the link to enter their name and download their certificate instantly.",
			side: "left",
			align: "center",
		},
	},
	{
		element: '[data-tour="tabs"]',
		popover: {
			title: "Manage Recipients",
			description:
				"Switch to the Recipients tab to add names and emails for bulk certificate generation.",
			side: "bottom",
			align: "center",
		},
	},
	{
		element: "header",
		popover: {
			title: "You're All Set! 🎉",
			description:
				'Start by uploading a certificate template. Click "Take a Tour" anytime to see this guide again.',
			side: "bottom",
			align: "center",
		},
	},
];

export const adminPageTourSteps: DriveStep[] = [
	{
		element: '[data-tour="public-id"]',
		popover: {
			title: "Set Certificate ID",
			description:
				"Enter a unique, memorable ID for your certificate. Participants will use this to retrieve their template.",
			side: "bottom",
			align: "start",
		},
	},
	{
		element: '[data-tour="admin-upload"]',
		popover: {
			title: "Upload Template",
			description:
				"Click here to select your certificate image. Supports PNG, JPG, and PDF formats up to 10MB.",
			side: "top",
			align: "center",
		},
	},
	{
		element: '[data-tour="admin-submit"]',
		popover: {
			title: "Share with Participants",
			description:
				"After uploading, you'll get a shareable link and ID. Send this to your participants so they can download personalized certificates.",
			side: "top",
			align: "center",
		},
	},
];

export const participantPageTourSteps: DriveStep[] = [
	{
		element: '[data-tour="certificate-id-input"]',
		popover: {
			title: "Enter Your ID",
			description:
				"Paste the certificate ID you received from the event organizer.",
			side: "bottom",
			align: "start",
		},
	},
	{
		element: '[data-tour="retrieve-btn"]',
		popover: {
			title: "Load Certificate",
			description:
				"Click this button to retrieve your certificate template. You'll then be able to customize and download it.",
			side: "left",
			align: "center",
		},
	},
];

export const TOUR_STORAGE_KEYS = {
	index: "tour_completed_index",
	admin: "tour_completed_admin",
	participant: "tour_completed_participant",
} as const;
