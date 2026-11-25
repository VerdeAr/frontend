import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVisualViewport } from "./useVisualViewport";

describe("useVisualViewport", () => {
	const originalInnerWidth = window.innerWidth;
	const originalInnerHeight = window.innerHeight;
	const originalVisualViewport = window.visualViewport;

	beforeEach(() => {
		window.innerWidth = 360;
		window.innerHeight = 800;
	});

	afterEach(() => {
		window.innerWidth = originalInnerWidth;
		window.innerHeight = originalInnerHeight;
		Object.defineProperty(window, "visualViewport", {
			configurable: true,
			writable: true,
			value: originalVisualViewport,
		});
		vi.restoreAllMocks();
	});

	it("retorna o estado inicial baseado nas dimensões da janela quando visualViewport não existe", () => {
		Object.defineProperty(window, "visualViewport", {
			configurable: true,
			writable: true,
			value: null,
		});

		const { result } = renderHook(() => useVisualViewport());

		expect(result.current.width).toBe(360);
		expect(result.current.height).toBe(800);
		expect(result.current.isLandscape).toBe(false);
		expect(result.current.isKeyboardOpen).toBe(false);
	});

	it("detecta orientação horizontal quando a largura é maior que a altura", () => {
		window.innerWidth = 800;
		window.innerHeight = 360;

		const { result } = renderHook(() => useVisualViewport());

		expect(result.current.width).toBe(800);
		expect(result.current.height).toBe(360);
		expect(result.current.isLandscape).toBe(true);
	});

	it("não considera landscape em celular em pé com teclado aberto (largura menor que 500px)", () => {
		window.innerWidth = 360;
		window.innerHeight = 340;

		const { result } = renderHook(() => useVisualViewport());

		expect(result.current.width).toBe(360);
		expect(result.current.height).toBe(340);
		expect(result.current.isLandscape).toBe(false);
	});

	it("atualiza o estado e detecta teclado virtual aberto ao receber evento de resize no visualViewport", () => {
		const listeners = new Map<string, () => void>();
		const mockVisualViewport = {
			width: 800,
			height: 360,
			addEventListener: vi.fn((event: string, callback: () => void) => {
				listeners.set(event, callback);
			}),
			removeEventListener: vi.fn((event: string) => {
				listeners.delete(event);
			}),
		};

		Object.defineProperty(window, "visualViewport", {
			configurable: true,
			writable: true,
			value: mockVisualViewport,
		});

		window.innerWidth = 800;
		window.innerHeight = 360;

		const { result } = renderHook(() => useVisualViewport());

		expect(result.current.height).toBe(360);
		expect(result.current.isKeyboardOpen).toBe(false);

		// Simula abertura do teclado virtual em modo horizontal (altura cai de 360 para 160)
		mockVisualViewport.height = 160;
		act(() => {
			const resizeCallback = listeners.get("resize");
			resizeCallback?.();
		});

		expect(result.current.height).toBe(160);
		expect(result.current.isKeyboardOpen).toBe(true);
	});

	it("remove os event listeners ao desmontar", () => {
		const removeEventListener = vi.fn();
		const mockVisualViewport = {
			width: 360,
			height: 800,
			addEventListener: vi.fn(),
			removeEventListener,
		};

		Object.defineProperty(window, "visualViewport", {
			configurable: true,
			writable: true,
			value: mockVisualViewport,
		});

		const { unmount } = renderHook(() => useVisualViewport());
		unmount();

		expect(removeEventListener).toHaveBeenCalledWith(
			"resize",
			expect.any(Function),
		);
		expect(removeEventListener).toHaveBeenCalledWith(
			"scroll",
			expect.any(Function),
		);
	});
});
