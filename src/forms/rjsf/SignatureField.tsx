import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FieldProps, FormContextType, RJSFSchema } from "@rjsf/utils";
import SignatureCanvas from "react-signature-canvas";
import { useTheme } from "../../theme/use-theme";
import type { WorkforceChecklistRjsfFormData } from "../workforce/types";

const DEFAULT_CANVAS_WIDTH = 640;
const DEFAULT_CANVAS_HEIGHT = 180;
const FALLBACK_PEN_COLOR = "#111111";
const FALLBACK_BG_COLOR = "#ffffff";

type SignatureFieldOptions = {
  canvasWidth?: number;
  canvasHeight?: number;
};

type WorkforceFormContext = FormContextType & {
  submitAttempted?: boolean;
};

export default function SignatureField(
  props: Readonly<
    FieldProps<WorkforceChecklistRjsfFormData, RJSFSchema, WorkforceFormContext>
  >
) {
  const {
    id,
    formData,
    onChange,
    disabled,
    readonly,
    rawErrors,
    uiSchema,
    fieldPathId,
    schema,
  } = props;
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const lastDataUrlRef = useRef<string | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const [penColor, setPenColor] = useState(FALLBACK_PEN_COLOR);
  const [bgColor, setBgColor] = useState(FALLBACK_BG_COLOR);
  const [canvasSize, setCanvasSize] = useState(() => ({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
  }));

  const options = (uiSchema?.["ui:options"] ?? {}) as SignatureFieldOptions;
  const canvasWidth = options.canvasWidth ?? DEFAULT_CANVAS_WIDTH;
  const canvasHeight = options.canvasHeight ?? DEFAULT_CANVAS_HEIGHT;
  const isDisabled = Boolean(disabled || readonly);
  const hasError = Boolean(rawErrors?.length);
  const description = uiSchema?.["ui:description"] ?? schema?.description;

  const value = useMemo(
    () => (typeof formData === "string" ? formData : undefined),
    [formData]
  );

  useEffect(() => {
    const updateColors = () => {
      const styles = getComputedStyle(document.documentElement);
      const foreground = styles.getPropertyValue("--foreground").trim();
      const background = styles.getPropertyValue("--background").trim();

      setPenColor(foreground || FALLBACK_PEN_COLOR);
      setBgColor(background || FALLBACK_BG_COLOR);
    };

    updateColors();

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => updateColors();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    const canvas = signatureRef.current;
    if (!canvas) return;

    if (value && value !== lastDataUrlRef.current) {
      canvas.fromDataURL(value);
      lastDataUrlRef.current = value;
      return;
    }

    if (!value && lastDataUrlRef.current) {
      canvas.clear();
      lastDataUrlRef.current = undefined;
    }
  }, [value]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateSize = () => {
      const nextWidth = Math.max(1, Math.floor(wrapper.clientWidth));
      const nextHeight = Math.max(1, Math.floor(wrapper.clientHeight));
      setCanvasSize((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight }
      );
    };

    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateSize());
      observer.observe(wrapper);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleEnd = useCallback(() => {
    const canvas = signatureRef.current;
    if (!canvas) return;

    const nextValue = canvas.isEmpty()
      ? undefined
      : canvas.toDataURL("image/png");
    lastDataUrlRef.current = nextValue;
    onChange(
      nextValue as WorkforceChecklistRjsfFormData | undefined,
      fieldPathId.path,
      undefined,
      fieldPathId.$id
    );
  }, [fieldPathId.$id, fieldPathId.path, onChange]);

  const handleClear = useCallback(() => {
    const canvas = signatureRef.current;
    if (!canvas) return;

    canvas.clear();
    lastDataUrlRef.current = undefined;
    onChange(undefined, fieldPathId.path, undefined, fieldPathId.$id);
  }, [fieldPathId.$id, fieldPathId.path, onChange]);

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor={id} className="block text-sm font-medium leading-6">
          {props.label || "Signature"}
        </label>
      </div>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {String(description)}
        </p>
      ) : null}
      <div
        ref={wrapperRef}
        className={
          hasError
            ? "overflow-hidden rounded-md border border-destructive/60 ring-1 ring-destructive/40"
            : "overflow-hidden rounded-md border border-input"
        }
        style={{ height: `${canvasHeight}px`, backgroundColor: bgColor }}
      >
        <SignatureCanvas
          ref={signatureRef}
          onEnd={handleEnd}
          clearOnResize={false}
          penColor={penColor}
          backgroundColor={bgColor}
          canvasProps={{
            id,
            width: canvasSize.width || canvasWidth,
            height: canvasSize.height || canvasHeight,
            className: "h-full w-full",
            style: {
              backgroundColor: bgColor,
              pointerEvents: isDisabled ? "none" : "auto",
            },
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Use your mouse, trackpad, or touch to sign.</span>
        <button
          type="button"
          onClick={handleClear}
          disabled={isDisabled}
          className="rounded-md border border-input px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
        >
          Clear signature
        </button>
      </div>
    </div>
  );
}
