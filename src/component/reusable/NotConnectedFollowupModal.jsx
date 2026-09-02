import React, { useState } from "react";

const NotConnectedFollowupModal = ({ isOpen, onClose, onSubmit, leadName }) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setRemarks(e.target.value);
    setError("");
  };

  const handleSubmit = () => {
    if (!remarks || !remarks.trim()) {
      setError("Remarks/reason is required");
      return;
    }

    onSubmit(remarks.trim());
    setRemarks("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Mark as Not Connected
            </h2>
            {leadName && (
              <p className="text-xs text-gray-500 mt-0.5">Lead: {leadName}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-red-500"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <span className="font-bold">Important:</span> This will mark this follow-up as <b>NOT_CONNECTED</b> and automatically synchronize the lead&apos;s current status to <b>NOT_CONNECTED</b>.
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Not Connected Remarks / Reason <span className="text-red-500">*</span>
            </label>

            <textarea
              rows={4}
              value={remarks}
              onChange={handleChange}
              placeholder="e.g., Student phone was ringing but unanswered, call not picked up..."
              className={`w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500 text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-5">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-orange-600 px-5 py-2 text-white hover:bg-orange-700 text-sm font-medium"
          >
            Confirm Not Connected
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotConnectedFollowupModal;
