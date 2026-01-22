import { TextField } from "@/types/TextField";
import { motion } from "framer-motion";
import { RefObject, useEffect, useState } from "react";

interface CertificatePreviewProps {
	templateUrl: string | null;
	fields: TextField[];
	selectedFieldId: string;
	onFieldSelect: (id: string) => void;
	showPreview: boolean;
	previewRef: RefObject<HTMLDivElement>;
	imgRef: RefObject<HTMLImageElement>;
	isParticipant?: boolean;
}

const CertificatePreview = ({
	templateUrl,
	fields,
	selectedFieldId,
	onFieldSelect,
	showPreview,
	previewRef,
	imgRef,
	isParticipant = false,
}: CertificatePreviewProps) => {
	const [imageScale, setImageScale] = useState({
		scale: 1,
		offsetX: 0,
		offsetY: 0,
	});

	// Calculate actual image dimensions and scale
	useEffect(() => {
		const calculateImageScale = () => {
			if (!imgRef.current || !previewRef.current) return;

			const img = imgRef.current;
			const container = previewRef.current;

			const naturalWidth = img.naturalWidth;
			const naturalHeight = img.naturalHeight;
			const containerWidth = container.clientWidth;
			const containerHeight = container.clientHeight;

			if (!naturalWidth || !naturalHeight) return;

			// Calculate how the image is scaled by object-contain
			const scaleX = containerWidth / naturalWidth;
			const scaleY = containerHeight / naturalHeight;
			const scale = Math.min(scaleX, scaleY);

			// Calculate the rendered image dimensions
			const renderedWidth = naturalWidth * scale;
			const renderedHeight = naturalHeight * scale;

			// Calculate offset caused by centering
			const offsetX = (containerWidth - renderedWidth) / 2;
			const offsetY = (containerHeight - renderedHeight) / 2;

			setImageScale({ scale, offsetX, offsetY });
		};

		if (imgRef.current) {
			const img = imgRef.current;

			if (img.complete && img.naturalWidth) {
				calculateImageScale();
			} else {
				img.onload = calculateImageScale;
			}
		}

		window.addEventListener("resize", calculateImageScale);
		return () => window.removeEventListener("resize", calculateImageScale);
	}, [templateUrl, imgRef, previewRef]);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
			className="relative w-full h-full flex items-center justify-center"
		>
			{templateUrl ? (
				<div
					ref={previewRef}
					className="relative max-w-5xl w-full aspect-[1.414/1] shadow-medium rounded-xs overflow-hidden bg-muted"
				>
					<img
						ref={imgRef}
						src={templateUrl}
						alt="Certificate Template"
						className="w-full h-full object-contain"
					/>

					{showPreview &&
						fields &&
						fields?.length &&
						fields?.map((field) => (
							<motion.span
								key={field.id}
								onClick={() =>
									!isParticipant && onFieldSelect(field.id)
								}
								className={`absolute cursor-pointer ${
									!isParticipant &&
									field.id === selectedFieldId
										? "ring-2 ring-primary ring-offset-2 rounded-sm"
										: ""
								}`}
								style={{
									left: `${field.x * imageScale.scale + imageScale.offsetX}px`,
									top: `${field.y * imageScale.scale + imageScale.offsetY}px`,
									transform:
										field.anchorMode === "center"
											? "translate(-50%, -50%)"
											: "translate(0%, -50%)",

									fontFamily: `"${field.font}"`,
									fontSize: `${field.fontSize * imageScale.scale}px`,
									fontWeight: field.fontWeight,
									color: field.color,
									whiteSpace: "nowrap",
									display: "inline-flex",
									alignItems: "center",
									lineHeight: "1",
									padding: "0",
									margin: "0",
								}}
							>
								{field.text}
							</motion.span>
						))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center max-w-md text-center space-y-4">
					<div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
						<svg
							className="w-10 h-10 text-muted-foreground"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</div>
					<div className="space-y-2">
						<h3 className="text-lg font-medium">
							No template uploaded
						</h3>
						<p className="text-sm text-muted-foreground">
							Upload a certificate template to get started
						</p>
					</div>
				</div>
			)}
		</motion.div>
	);
};

export default CertificatePreview;
