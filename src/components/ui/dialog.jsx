import React from "react";

const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
        {children}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
          onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-bold">{children}</h2>
);

const DialogContent = ({ children }) => <div className="mt-2">{children}</div>;

const DialogFooter = ({ children }) => (
  <div className="mt-4 flex justify-end space-x-2">{children}</div>
);

export { Dialog, DialogTitle, DialogContent, DialogFooter };
