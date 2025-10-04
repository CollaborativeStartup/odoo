import React, { useState } from "react";

const SetRules = () => {
  const [selectedUser, setSelectedUser] = useState("marc");
  const [ruleName, setRuleName] = useState(
    "Approval rule for miscellaneous expenses"
  );
  const [manager, setManager] = useState("sarah");
  const [isManagerApprover, setIsManagerApprover] = useState(false);
  const [approversSequence, setApproversSequence] = useState(false);
  const [minApprovalPercentage, setMinApprovalPercentage] = useState("");
  const [approvers, setApprovers] = useState([
    { id: 1, name: "John", required: true },
    { id: 2, name: "Mitchell", required: false },
    { id: 3, name: "Andreas", required: false },
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        Admin View (Approval rules)
      </h2>

      <div className="bg-white border-2 border-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">User</label>
          <input
            type="text"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full border-b-2 border-gray-800 px-2 py-1 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Description about rules
          </label>
          <input
            type="text"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="w-full border-b-2 border-gray-800 px-2 py-1 focus:outline-none"
          />
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium">Manager:</label>
          <select
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
          >
            <option>sarah</option>
            <option>marc</option>
          </select>
        </div>

        <div className="mb-4 text-sm text-gray-600 italic border-l-4 border-gray-300 pl-4 mb-6">
          Dynamic dropdown: Initially the manager set on user record should be
          set, admin can change manager for approval if required.
        </div>

        <div className="mb-6">
          <div className="flex items-start gap-3 mb-4">
            <input
              type="checkbox"
              id="managerApprover"
              checked={isManagerApprover}
              onChange={(e) => setIsManagerApprover(e.target.checked)}
              className="mt-1"
            />
            <div>
              <label htmlFor="managerApprover" className="font-medium">
                Is manager an approver?
              </label>
              <div className="text-sm text-gray-500 mt-1">
                If this field is checked then by default the approval request
                would go to his/her manager first, before going to other
                approvers
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-4">Approvers</h3>
          <div className="flex justify-end mb-2">
            <span className="text-sm font-medium">Required</span>
          </div>
          {approvers.map((approver, index) => (
            <div key={approver.id} className="flex items-center gap-4 mb-3">
              <span className="w-8 text-center font-medium">{index + 1}</span>
              <input
                type="text"
                value={approver.name}
                className="flex-1 border-b border-gray-300 px-2 py-1"
                readOnly
              />
              <input
                type="checkbox"
                checked={approver.required}
                onChange={() => {
                  const updated = [...approvers];
                  updated[index].required = !updated[index].required;
                  setApprovers(updated);
                }}
                className="w-5 h-5"
              />
            </div>
          ))}
          <div className="text-xs text-gray-500 mt-2 ml-12">
            If the checkbox is ticked, then the approval of this approver is
            required for approval transaction outcome.
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-start gap-3 mb-2">
            <input
              type="checkbox"
              id="approversSequence"
              checked={approversSequence}
              onChange={(e) => setApproversSequence(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="approversSequence" className="font-medium">
              Approvers Sequence:
            </label>
          </div>
          <div className="text-sm text-gray-500 ml-6">
            If this field is ticked true then the above mentioned sequence of
            approvers matters, that is first the request goes to John, if he
            approves/rejects then only request goes to Mitchell and so on.
            <br />
            If the required approver rejects the request, then expense request
            is auto-rejected.
            <br />
            If not ticked then send approver request to all approvers at the
            same time.
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium">Minimum Approval percentage:</label>
            <input
              type="number"
              value={minApprovalPercentage}
              onChange={(e) => setMinApprovalPercentage(e.target.value)}
              className="w-24 border-b-2 border-gray-800 px-2 py-1 focus:outline-none"
              placeholder="0"
            />
            <span className="font-medium">%</span>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Specify the number of percentage approvers required in order to get
            the request approved.
          </div>
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save
          </button>
          <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetRules;
