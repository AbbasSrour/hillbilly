import { cn } from "@hillbilly/ui/lib/utils";
import { isAxiosError } from "axios";
import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "../../core/button";

export type ErrorType = "401" | "403" | "404" | "500" | "503";

interface ErrorProps extends HTMLAttributes<HTMLDivElement> {
  statusCode?: ErrorType | number;
  minimal?: boolean;
  message?: string;
  description?: string;
  errorMessage?: string;
  error?: unknown;
  reset?: () => void;
  back?: () => void;
  home?: () => void;
  learnMoreUrl?: string;
  actions?: ReactNode;
}

type ErrorConfig = {
  defaultMessage: string;
  defaultDescription: string[];
};

const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  "401": {
    defaultMessage: "Unauthorized Access",
    defaultDescription: [
      "Please log in with the appropriate credentials",
      "to access this resource.",
    ],
  },
  "403": {
    defaultMessage: "Access Forbidden",
    defaultDescription: ["You don't have necessary permission", "to view this resource."],
  },
  "404": {
    defaultMessage: "Oops! Page Not Found!",
    defaultDescription: [
      "It seems like the page you're looking for",
      "does not exist or might have been removed.",
    ],
  },
  "500": {
    defaultMessage: "Oops! Something went wrong :)",
    defaultDescription: ["We apologize for the inconvenience.", "Please try again later."],
  },
  "503": {
    defaultMessage: "Website is under maintenance!",
    defaultDescription: [
      "The site is not available at the moment.",
      "We'll be back online shortly.",
    ],
  },
};

function determineStatusCode(props: ErrorProps): ErrorType {
  if (props.statusCode) {
    if (Object.keys(ERROR_CONFIGS).includes(String(props.statusCode))) {
      return String(props.statusCode) as ErrorType;
    }

    const code = Number(props.statusCode);
    if (code === 401) return "401";
    if (code === 403) return "403";
    if (code === 404) return "404";
    if (code >= 500 && code < 503) return "500";
    if (code === 503) return "503";
  }

  return "500";
}

// TODO this needs more adjustments
export function ErrorComponent({
  className,
  statusCode: providedStatusCode,
  minimal = false,
  message,
  description,
  errorMessage,
  error,
  reset,
  back,
  home,
  learnMoreUrl,
  actions,
  ...props
}: ErrorProps) {
  let statusCode = providedStatusCode;
  let extractedErrorMessage = errorMessage;

  if (error) {
    if (isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      if (!extractedErrorMessage) {
        extractedErrorMessage = error.message;
      }
    }
  }

  const errorType = determineStatusCode({ statusCode });
  const config = ERROR_CONFIGS[errorType];

  const displayMessage = message || config.defaultMessage;
  const displayDescription = description || config.defaultDescription.join("<br />");

  return (
    <div className={cn("h-full w-full", className)} {...props}>
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        {!minimal && <h1 className="text-[7rem] leading-tight font-bold">{errorType}</h1>}
        <span className="font-medium">{displayMessage}</span>
        <p
          className="text-muted-foreground text-center"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{ __html: displayDescription }}
        />
        {!minimal && (
          <div className="mt-6 flex gap-4">
            {actions || (
              <>
                {back && (
                  <Button variant="outline" onClick={back}>
                    Go Back
                  </Button>
                )}
                {errorType === "503" && learnMoreUrl && (
                  <Button variant="outline" onClick={() => window.open(learnMoreUrl, "_blank")}>
                    Learn more
                  </Button>
                )}
                {reset ? (
                  <Button variant="default" onClick={reset}>
                    Try Again
                  </Button>
                ) : home ? (
                  <Button onClick={home}>Back to Home</Button>
                ) : null}
              </>
            )}
          </div>
        )}
        {extractedErrorMessage && (
          <p className="mt-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {extractedErrorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
