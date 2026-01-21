import { motion } from "framer-motion";
import { RefObject, useEffect, useRef, useState } from "react";

interface CertificatePreviewProps {
	templateUrl: string | null;
	previewName: string;
	showPreview: boolean;
	textPosition: { x: number; y: number };
	selectedFont: string;
	fontSize: number;
	fontWeight: string;
	textColor: string;
	previewRef: RefObject<HTMLDivElement>;
	imgRef: RefObject<HTMLImageElement>;
	anchorMode: "center" | "left";
}

const CertificatePreview = ({
	templateUrl,
	previewName,
	showPreview,
	textPosition,
	selectedFont,
	fontSize,
	fontWeight,
	textColor,
	previewRef,
	imgRef,
	anchorMode,
}: CertificatePreviewProps) => {
	const spanRef = useRef<HTMLSpanElement>(null);
	const [spanSize, setSpanSize] = useState({ w: 0, h: 0 });
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

	useEffect(() => {
		if (spanRef.current) {
			const rect = spanRef.current.getBoundingClientRect();
			setSpanSize({ w: rect.width, h: rect.height });
		}
	}, [previewName, fontSize, selectedFont, fontWeight, imageScale]);

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

					{showPreview && (
						<motion.span
							ref={spanRef}
							className="absolute pointer-events-none"
							// Inside the motion.span style object
							style={{
								left: `${textPosition.x * imageScale.scale + imageScale.offsetX}px`,
								top: `${textPosition.y * imageScale.scale + imageScale.offsetY}px`,
								transform:
									anchorMode === "center"
										? "translate(-50%, -50%)"
										: "translate(0, 0)",
								fontFamily: `"${selectedFont}"`,
								fontSize: `${fontSize * imageScale.scale}px`,
								fontWeight,
								color: textColor,
								whiteSpace: "nowrap",
								display: "block", // Changed from inline-block to block
								lineHeight: "0.8", // Script fonts often need slightly less than 1 to kill the 'leading'
								padding: "0",
								margin: "0",
								dominantBaseline: "hanging", // Helps with SVG-like positioning
							}}
						>
							{previewName}
						</motion.span>
					)}
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
