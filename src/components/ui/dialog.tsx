"use client";

import * as React from "react";
import { m, useReducedMotion } from "motion/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-200 data-[state=open]:duration-300",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    mobileSheet?: boolean;
  }
>(
  (
    {
      className,
      children,
      mobileSheet = false,
      onOpenAutoFocus,
      onCloseAutoFocus,
      ...props
    },
    ref,
  ) => {
    const reduced = useReducedMotion();
    const opener = React.useRef<HTMLElement | null>(null);
    return (
      <DialogPortal>
        <DialogOverlay />
        <div
          className="dialog-positioner"
          data-mobile-sheet={mobileSheet || undefined}
        >
          <DialogPrimitive.Content
            ref={ref}
            asChild
            {...props}
            onOpenAutoFocus={(event) => {
              opener.current =
                document.activeElement instanceof HTMLElement
                  ? document.activeElement
                  : null;
              onOpenAutoFocus?.(event);
            }}
            onCloseAutoFocus={(event) => {
              onCloseAutoFocus?.(event);
              if (
                !event.defaultPrevented &&
                opener.current?.isConnected &&
                opener.current !== document.body
              ) {
                event.preventDefault();
                opener.current.focus();
              }
            }}
          >
            <m.div
              initial={{ opacity: 0, y: reduced ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? 0 : 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "dialog-panel pointer-events-auto relative grid min-w-0 w-full max-w-lg gap-6 overflow-y-auto overscroll-contain rounded-xl border bg-background p-6 shadow-[0_12px_32px_rgb(0_0_0/12%)] dark:shadow-[0_12px_32px_rgb(0_0_0/35%)]",
                className,
              )}
            >
              {children}
              <DialogPrimitive.Close className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </m.div>
          </DialogPrimitive.Content>
        </div>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left pr-10",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
