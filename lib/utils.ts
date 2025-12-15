import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Download a blob as a file in the browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.style.visibility = "hidden";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * Download text content as a file in the browser
 */
export function downloadText(
	content: string,
	filename: string,
	mimeType: string = "text/plain"
): void {
	const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
	downloadBlob(blob, filename);
}
