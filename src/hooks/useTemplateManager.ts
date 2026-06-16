import { logEvent } from "@/lib/analytics";
import {
	hasTemplateSource,
	resolveTemplateFile,
} from "@/lib/templateFileUtils";
import api from "@/services/axios";
import type { Recipient, TextField } from "@/types/TextField";
import axios from "axios";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthContext } from "./useAuthContext";

interface UseTemplateManagerProps {
	templateFile: File | null;
	templateUrl: string | null;
	fields: TextField[];
	recipients: Recipient[];
	customPublicId: string;
	isPublishing: boolean;
	setTemplateFile: React.Dispatch<React.SetStateAction<File | null>>;
	setTemplateUrl: React.Dispatch<React.SetStateAction<string | null>>;
	setCustomPublicId: React.Dispatch<React.SetStateAction<string>>;
	setIsPublishing: React.Dispatch<React.SetStateAction<boolean>>;
	setShowIdDialog: React.Dispatch<React.SetStateAction<boolean>>;
	setShowShareDialog: React.Dispatch<React.SetStateAction<boolean>>;
	setGeneratedLink: React.Dispatch<React.SetStateAction<string>>;
}

interface CheckIdResponse {
	exists: boolean;
}

interface UploadResponse {
	public_id?: string;
	secure_url?: string;
}

const useTemplateManager = ({
	templateFile,
	templateUrl,
	fields,
	recipients,
	customPublicId,
	isPublishing,
	setTemplateFile,
	setTemplateUrl,
	setCustomPublicId,
	setIsPublishing,
	setShowIdDialog,
	setShowShareDialog,
	setGeneratedLink,
}: UseTemplateManagerProps) => {
	const { isAuthenticated, BASE_URL } = useAuthContext();

	// Revoke local blob URLs to avoid memory leaks
	useEffect(() => {
		return () => {
			if (templateUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(templateUrl);
			}
		};
	}, [templateUrl]);

	// When we have a remote URL but no file, prefetch it so generate works offline
	useEffect(() => {
		if (templateFile || !templateUrl) return;
		let cancelled = false;
		void resolveTemplateFile(null, templateUrl).then((file) => {
			if (!cancelled && file) setTemplateFile(file);
		});
		return () => {
			cancelled = true;
		};
	}, [templateFile, templateUrl, setTemplateFile]);

	const handleDownload = async () => {
		if (!hasTemplateSource(templateFile, templateUrl)) {
			toast.error("Please upload a template first");
			return;
		}

		const resolvedFile = await resolveTemplateFile(templateFile, templateUrl);
		if (!resolvedFile) {
			toast.error("Failed to load the selected template");
			return;
		}

		const formData = new FormData();
		formData.append("template", resolvedFile);
		formData.append("fields", JSON.stringify(fields));
		formData.append("inEditor", "true");

		try {
			const response = await axios.post(
				`${BASE_URL}/generate/`,
				formData,
				{ responseType: "blob" },
			);

			const url = URL.createObjectURL(response.data as Blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "Certificate.png";
			link.click();
			URL.revokeObjectURL(url);

			logEvent("Certificate", "Generate", "Editor Generation");
			toast.success("Download complete");
		} catch {
			toast.error("Failed to generate certificate");
		}
	};

	const handleBatchDownload = async () => {
		if (!hasTemplateSource(templateFile, templateUrl)) {
			toast.error("Please upload a template first");
			return;
		}
		if (recipients.length === 0) {
			toast.error("Please add at least one recipient");
			return;
		}

		const resolvedFile = await resolveTemplateFile(templateFile, templateUrl);
		if (!resolvedFile) {
			toast.error("Failed to load the selected template");
			return;
		}

		const toastId = toast.loading(`Generating ${recipients.length} certificate(s)...`);
		const formData = new FormData();
		formData.append("template", resolvedFile);
		formData.append("fields", JSON.stringify(fields));
		formData.append("recipients", JSON.stringify(recipients));
		formData.append("inEditor", "true");

		try {
			const response = await api.post(`${BASE_URL}/generate-batch/`, formData, {
				responseType: "blob",
			});

			const url = URL.createObjectURL(response.data as Blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "certificates.zip";
			link.click();
			URL.revokeObjectURL(url);

			logEvent("Certificate", "BatchGenerate", `${recipients.length} recipients`);
			toast.dismiss(toastId);
			toast.success(`${recipients.length} certificate(s) downloaded as ZIP`);

			const batchErrors = response.headers["x-batch-errors"];
			if (batchErrors) {
				toast.warning(`Some certificates had errors: ${batchErrors}`);
			}
		} catch {
			toast.dismiss(toastId);
			toast.error("Batch generation failed");
		}
	};

	const handleTemplateUpload = async (file: File) => {
		if (!file) {
			toast.warning("Please select a file");
			return;
		}

		setTemplateFile(file);
		const url = URL.createObjectURL(file);
		setTemplateUrl(url);
		toast.success("Template loaded");

		if (isAuthenticated) {
			const formData = new FormData();
			formData.append("template", file);
			try {
				// Returns JSON { public_id, secure_url } — NOT a blob
				await api.post(`${BASE_URL}/upload/`, formData);
			} catch {
				// Non-fatal: the local template is still usable
			}
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) void handleTemplateUpload(file);
	};

	const handleShareClick = () => {
		if (!hasTemplateSource(templateFile, templateUrl)) {
			toast.error("Please upload a template first");
			return;
		}
		setShowIdDialog(true);
	};

	const checkId = async (publicId: string): Promise<boolean> => {
		const res = await api.post<CheckIdResponse>(
			`${BASE_URL}/check-public-id/`,
			{ public_id: publicId },
		);
		return res.data.exists;
	};

	const handlePublish = async () => {
		if (!hasTemplateSource(templateFile, templateUrl) || isPublishing) {
			if (!hasTemplateSource(templateFile, templateUrl)) {
				toast.error("Please upload a template first");
			}
			return;
		}

		setIsPublishing(true);
		const toastId = toast.loading("Uploading template...");

		try {
			const resolvedFile = await resolveTemplateFile(templateFile, templateUrl);
			if (!resolvedFile) {
				toast.dismiss(toastId);
				toast.error("Failed to load template");
				return;
			}

			let finalPublicId = customPublicId.trim();

			if (finalPublicId) {
				const exists = await checkId(finalPublicId);
				if (exists) {
					finalPublicId = `${finalPublicId}_${Date.now()}`;
					setCustomPublicId(finalPublicId);
					toast.info(`ID already taken. Using "${finalPublicId}" instead.`);
				}
			}

			const formData = new FormData();
			formData.append("template", resolvedFile);
			if (finalPublicId) formData.append("public_id", finalPublicId);

			const res = await api.post<UploadResponse>(`${BASE_URL}/upload/`, formData);

			if (res.data.public_id) {
				const encodedFields = btoa(JSON.stringify(fields));
				const params = new URLSearchParams({
					id: res.data.public_id,
					data: encodedFields,
				});
				const link = `${window.location.origin}/participant?${params.toString()}`;

				setGeneratedLink(link);
				setShowIdDialog(false);
				setShowShareDialog(true);

				logEvent("Certificate", "Publish", "New Template Published");
				toast.dismiss(toastId);
				toast.success("Published successfully!");
			}
		} catch {
			toast.dismiss(toastId);
			toast.error("Failed to publish template");
		} finally {
			setIsPublishing(false);
		}
	};

	return {
		handleDownload,
		handleBatchDownload,
		handleTemplateUpload,
		handleFileSelect,
		handleShareClick,
		handlePublish,
	};
};

export default useTemplateManager;
