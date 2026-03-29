"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, className, children }: TabsProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {React.Children.map(children, (child) => 
        React.isValidElement(child) ? React.cloneElement(child, { value, onValueChange } as React.Attributes) : child
      )}
    </div>
  );
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function TabsList({ className, children, value, onValueChange }: TabsListProps) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
      {React.Children.map(children, (child) => 
        React.isValidElement(child) ? React.cloneElement(child, { activeValue: value, onClick: onValueChange } as React.Attributes) : child
      )}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  activeValue?: string;
  onClick?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({ value, activeValue, onClick, className, children }: TabsTriggerProps) {
  const isActive = value === activeValue;
  return (
    <button
      onClick={() => onClick?.(value)}
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

interface TabsContentProps {
  value: string;
  activeValue?: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, activeValue, children, className }: TabsContentProps) {
  if (value !== activeValue) return null;
  return <div className={cn("mt-2", className)}>{children}</div>;
}
