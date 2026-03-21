"use client";

import { cn } from "@/lib/utils";
import React from "react";

export function Tabs({ value, onValueChange, className, children }: any) {
  return (
    <div className={cn("flex flex-col", className)}>
      {React.Children.map(children, (child) => 
        React.cloneElement(child, { value, onValueChange })
      )}
    </div>
  );
}

export function TabsList({ className, children, value, onValueChange }: any) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
      {React.Children.map(children, (child) => 
        React.cloneElement(child, { activeValue: value, onClick: onValueChange })
      )}
    </div>
  );
}

export function TabsTrigger({ value, activeValue, onClick, className, children }: any) {
  const isActive = value === activeValue;
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, activeValue, children, className }: any) {
  if (value !== activeValue) return null;
  return <div className={cn("mt-2", className)}>{children}</div>;
}
