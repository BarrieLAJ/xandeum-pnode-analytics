import { useState } from "react";
import { useEffect } from "react";

const useMediaViewport = () => {
	const [isMobile, setIsMobile] = useState(false);
	const [isTablet, setIsTablet] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
			setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
			setIsDesktop(window.innerWidth >= 1024);
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return { isMobile, isTablet, isDesktop };
};

export default useMediaViewport;
