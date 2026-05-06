import React, {} from "react";
import { Badge } from 'react-bootstrap'
import {FileEdit, PlusCircle, Trash2} from "lucide-react";


function formatPath(path) {
  return path
    .replace(/^\//, "")
    .split("/")
    .join(" → ");
}

function PatchEntry({entry}) {
  const icon = {
    add: <PlusCircle className="w-4 h-4"/>,
    replace: <FileEdit className="w-4 h-4"/>,
    remove: <Trash2 className="w-4 h-4"/>,
  }[entry.op];

  const description = {
    add: `Added ${formatPath(entry.path)}`,
    replace: `Changed ${formatPath(entry.path)}`,
    remove: `Removed ${formatPath(entry.path)}`,
  }[entry.op];

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <div className="font-medium">{description}</div>
        {entry.op !== "remove" && (
          <pre className="text-sm bg-slate-100 rounded-xl p-2 mt-2 overflow-x-auto">
            {JSON.stringify(entry.value, null, 2)}
          </pre>
        )}
      </div>
      <Badge variant="outline">{entry.op}</Badge>
    </div>
  );
}

export default function JsonPatchHistoryViewer({history}) {

  return history.map((entry, index) => (
    <PatchEntry key={index} entry={entry}/>
  ));
}

