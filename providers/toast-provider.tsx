"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Callout } from "@radix-ui/themes";

// 定义 Toast 类型
export type ToastType = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // 3秒后自动消失
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  const success = useCallback((message: string) => showToast(message, "success"), [showToast]);
  const error = useCallback((message: string) => showToast(message, "error"), [showToast]);
  const warning = useCallback((message: string) => showToast(message, "warning"), [showToast]);
  const info = useCallback((message: string) => showToast(message, "info"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast 容器：固定定位，居中显示，z-index 确保在最上层 */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-2"
          >
            <ToastItem message={toast.message} type={toast.type} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// 单个 Toast 组件 UI
const ToastItem = ({ message, type }: { message: string; type: ToastType }) => {
  let color: "green" | "red" | "amber" | "blue" = "blue";
  let Icon = InfoIcon;

  switch (type) {
    case "success":
      color = "green";
      Icon = CheckIcon;
      break;
    case "error":
      color = "red";
      Icon = CrossIcon;
      break;
    case "warning":
      color = "amber"; // Radix UI Themes 中黄色通常是 amber 或 yellow
      Icon = WarningIcon;
      break;
  }

  return (
    <Callout.Root variant="soft" color={color} className="shadow-lg backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
      <Callout.Icon>
        <Icon />
      </Callout.Icon>
      <Callout.Text size="2" weight="medium">
        {message}
      </Callout.Text>
    </Callout.Root>
  );
};

// 简单的 SVG 图标，避免引入额外依赖
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
);
const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.1929 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.1929 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
);
const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13.0065 1.10608 13.0065H13.8939C14.7475 13.0065 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12.0065 13.8939 12.0065H1.10608C1.02849 12.0065 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81232 4.32042 6.94297 4.18164 7.10924 4.18164H7.89076C8.05703 4.18164 8.18768 4.32042 8.1731 4.48612L7.8956 7.64112C7.8834 7.77983 7.76752 7.88614 7.62825 7.88614H7.37175C7.23248 7.88614 7.1166 7.77983 7.1044 7.64112L6.8269 4.48611ZM7.5 8.80614C7.16863 8.80614 6.9 9.07477 6.9 9.40614C6.9 9.73751 7.16863 10.0061 7.5 10.0061C7.83137 10.0061 8.1 9.73751 8.1 9.40614C8.1 9.07477 7.83137 8.80614 7.5 8.80614Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
);
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49999 0.875C3.84059 0.875 0.874985 3.84061 0.874985 7.5C0.874985 11.1594 3.84059 14.125 7.49999 14.125C11.1594 14.125 14.125 11.1594 14.125 7.5C14.125 3.84061 11.1594 0.875 7.49999 0.875ZM1.87499 7.5C1.87499 4.39289 4.39288 1.875 7.49999 1.875C10.6071 1.875 13.125 4.39289 13.125 7.5C13.125 10.6071 10.6071 13.125 7.49999 13.125C4.39288 13.125 1.87499 10.6071 1.87499 7.5ZM7.49999 3.825C7.16862 3.825 6.89999 4.09363 6.89999 4.425C6.89999 4.75637 7.16862 5.025 7.49999 5.025C7.83136 5.025 8.09999 4.75637 8.09999 4.425C8.09999 4.09363 7.83136 3.825 7.49999 3.825ZM6.89999 6.325C6.62385 6.325 6.39999 6.54886 6.39999 6.825V10.675C6.39999 10.9511 6.62385 11.175 6.89999 11.175H8.09999C8.37613 11.175 8.59999 10.9511 8.59999 10.675V6.825C8.59999 6.54886 8.37613 6.325 8.09999 6.325H6.89999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
);
