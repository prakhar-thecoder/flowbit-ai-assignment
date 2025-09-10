"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-700 group-[.toast]:opacity-90",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-300 group-[.toaster]:text-green-800 [&_[data-description]]:text-green-700 [&_[data-icon]]:text-green-600 [&_[data-title]]:text-green-900",
          error: "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-300 group-[.toaster]:text-red-800 [&_[data-description]]:text-red-700 [&_[data-icon]]:text-red-600 [&_[data-title]]:text-red-900",
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-300 group-[.toaster]:text-blue-800 [&_[data-description]]:text-blue-700 [&_[data-icon]]:text-blue-600 [&_[data-title]]:text-blue-600",
          warning: "group-[.toaster]:bg-yellow-50 group-[.toaster]:border-yellow-300 group-[.toaster]:text-yellow-800 [&_[data-description]]:text-yellow-700 [&_[data-icon]]:text-yellow-600 [&_[data-title]]:text-yellow-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
