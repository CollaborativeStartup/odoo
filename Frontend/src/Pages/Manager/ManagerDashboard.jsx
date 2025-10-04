import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function ManagerView() {
  const [approvals, setApprovals] = useState([
    {
      id: 1,
      subject: "none",
      requestOwner: "Sarah",
      category: "Food",
      status: "Pending",
      originalAmount: 567,
      originalCurrency: "INR",
      convertedAmount: 49896,
      companyCurrency: "USD",
    },
    {
      id: 2,
      subject: "Client Dinner",
      requestOwner: "John",
      category: "Food",
      status: "Pending",
      originalAmount: 15000,
      originalCurrency: "INR",
      convertedAmount: 180,
      companyCurrency: "USD",
    },
    {
      id: 3,
      subject: "Travel Reimbursement",
      requestOwner: "Mike",
      category: "Travel",
      status: "Pending",
      originalAmount: 25000,
      originalCurrency: "INR",
      convertedAmount: 300,
      companyCurrency: "USD",
    },
    {
      id: 4,
      subject: "Office Supplies",
      requestOwner: "Emma",
      category: "Supplies",
      status: "Pending",
      originalAmount: 5000,
      originalCurrency: "INR",
      convertedAmount: 60,
      companyCurrency: "USD",
    },
  ]);

  const handleApprove = (id) => {
    setApprovals(
      approvals.map((approval) =>
        approval.id === id ? { ...approval, status: "Approved" } : approval
      )
    );
  };

  const handleReject = (id) => {
    setApprovals(
      approvals.map((approval) =>
        approval.id === id ? { ...approval, status: "Rejected" } : approval
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-600";
      case "Rejected":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Manager's View</h1>

      <div className="bg-white border-2 border-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Approvals to review</h2>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Note:</span> Once the expense is
            approved/rejected by manager, that record should become readonly,
            the status should get set in request status field and the buttons
            should become invisible.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left p-2 font-semibold">
                  Approval Subject
                </th>
                <th className="text-left p-2 font-semibold">Request Owner</th>
                <th className="text-left p-2 font-semibold">Category</th>
                <th className="text-left p-2 font-semibold">Request Status</th>
                <th className="text-left p-2 font-semibold">
                  Total amount
                  <br />
                  <span className="text-xs font-normal text-gray-500">
                    (in company's currency)
                  </span>
                </th>
                <th className="text-left p-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => (
                <tr
                  key={approval.id}
                  className={`border-b border-gray-300 ${
                    approval.status !== "Pending" ? "bg-gray-50 opacity-60" : ""
                  }`}
                >
                  <td className="p-2">{approval.subject}</td>
                  <td className="p-2">{approval.requestOwner}</td>
                  <td className="p-2">{approval.category}</td>
                  <td className="p-2">
                    <span
                      className={`font-semibold ${getStatusColor(
                        approval.status
                      )}`}
                    >
                      {approval.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-red-600">
                        {approval.originalAmount} {approval.originalCurrency}{" "}
                        (in {approval.originalCurrency})
                      </span>
                      <span className="font-medium">
                        = {approval.convertedAmount} {approval.companyCurrency}
                      </span>
                    </div>
                  </td>
                  <td className="p-2">
                    {approval.status === "Pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(approval.id)}
                          className="px-3 py-1 bg-white border-2 border-green-600 text-green-600 rounded hover:bg-green-50 text-sm font-medium flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(approval.id)}
                          className="px-3 py-1 bg-white border-2 border-red-600 text-red-600 rounded hover:bg-red-50 text-sm font-medium flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {approvals.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No approvals to review at this time
          </div>
        )}
      </div>
    </div>
  );
}
