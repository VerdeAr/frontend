import { useEffect, useState } from "react";

export interface VisualViewportState {
	height: number;
	width: number;
	isKeyboardOpen: boolean;
	isLandscape: boolean;
}

const KEYBOARD_MIN_DIFF_PX = 150;

function getViewportState(): VisualViewportState {
	if (typeof window === "undefined") {
		return {
			height: 800,
			width: 360,
			isKeyboardOpen: false,
			isLandscape: false,
		};
	}

	const vv = window.visualViewport;
	const width = vv ? vv.width : window.innerWidth;
	const height = vv ? vv.height : window.innerHeight;
	const windowHeight = window.innerHeight;

	const isKeyboardOpen = windowHeight - height > KEYBOARD_MIN_DIFF_PX;
	const isLandscape = width >= 500 && width > height;

	return {
		height,
		width,
		isKeyboardOpen,
		isLandscape,
	};
}

export function useVisualViewport(): VisualViewportState {
	const [viewportState, setViewportState] =
		useState<VisualViewportState>(getViewportState);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const updateState = () => {
			setViewportState(getViewportState());
		};

		const vv = window.visualViewport;
		if (vv) {
			vv.addEventListener("resize", updateState);
			vv.addEventListener("scroll", updateState);
		}

		window.addEventListener("resize", updateState);
		window.addEventListener("orientationchange", updateState);

		updateState();

		return () => {
			if (vv) {
				vv.removeEventListener("resize", updateState);
				vv.removeEventListener("scroll", updateState);
			}
			window.removeEventListener("resize", updateState);
			window.removeEventListener("orientationchange", updateState);
		};
	}, []);

	return viewportState;
}
