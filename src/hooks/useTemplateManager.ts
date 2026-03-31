import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { logEvent } from "@/lib/analytics";
import api from "@/services/axios";
import { Recipient, TextField } from "@/types/TextField";

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
	const BASE_URL = import.meta.env.VITE_BASE_URL;

	useEffect(() => {
		return () => {
			if (templateUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(templateUrl);
			}
		};
	}, [templateUrl]);

	const handleDownload = async () => {
		if (!templateFile) {
			toast.error("Please upload a template first");
			return;
		}

		const formData = new FormData();
		formData.append("template", templateFile);
		formData.append("recipients", JSON.stringify(recipients));
		formData.append("fields", JSON.stringify(fields));
		formData.append("inEditor", "true");

		try {
			const response = await api.post(`${BASE_URL}/generate/`, formData, {
				responseType: "blob",
			});

			const url = URL.createObjectURL(response.data);
			const link = document.createElement("a");
			link.href = url;
			link.download = "Certificate.png";
			link.click();
			URL.revokeObjectURL(url);

			logEvent("Certificate", "Generate", "Editor Generation");
			toast.success("Download Complete.");
		} catch {
			toast.error("Failed to generate certificates");
		}
	};

	const handleTemplateUpload = (file: File) => {
		setTemplateFile(file);
		const url = URL.createObjectURL(file);
		setTemplateUrl(url);
		toast.success("Template loaded locally");
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleTemplateUpload(file);
		}
	};

	const handleShareClick = () => {
		if (!templateFile) {
			toast.error("Please upload a template first");
			return;
		}
		setShowIdDialog(true);
	};

	const checkId = async (publicId: string): Promise<boolean> => {
		const res = await axios.post<CheckIdResponse>(
			`${BASE_URL}/check_public_id/`,
			{
				public_id: publicId,
			},
		);
		return res.data.exists;
	};

	const handlePublish = async () => {
		if (!templateFile || isPublishing) {
			return;
		}

		setIsPublishing(true);
		const toastId = toast.loading("Uploading and saving configuration...");

		try {
			let finalPublicId = customPublicId.trim();

			if (finalPublicId) {
				const exists = await checkId(finalPublicId);
				if (exists) {
					finalPublicId = `${finalPublicId}_${Date.now()}`;
					setCustomPublicId(finalPublicId);
					toast.info(`ID exists. Using ${finalPublicId} instead.`);
				}
			}

			const formData = new FormData();
			formData.append("template", templateFile);
			if (finalPublicId) {
				formData.append("public_id", finalPublicId);
			}

			const encodedFields = btoa(JSON.stringify(fields));
			const res = await axios.post<UploadResponse>(
				`${BASE_URL}/upload/`,
				formData,
			);

			if (res.data.public_id) {
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
		} catch (error) {
			console.error(error);
			toast.dismiss(toastId);
			toast.error("Failed to publish.");
		} finally {
			setIsPublishing(false);
		}
	};

	return {
		handleDownload,
		handleTemplateUpload,
		handleFileSelect,
		handleShareClick,
		handlePublish,
	};
};

export default useTemplateManager;
