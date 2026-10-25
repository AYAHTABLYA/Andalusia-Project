import { type FormEvent, useState } from "react";
import useWorkspace from "../../../hooks/workspaceHooks/useWorkspace";
import AssignmentsComponent from "./AssignmentsComponent";
import { ASSIGNMENT_ORDER } from "./constants";

function AssignmentsContainer() {
  const { workspace } = useWorkspace();
  const { assignments, loading } = workspace;
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");

  // Unfinished first, then submitted, then graded; soonest due date first inside each group.
  const sorted = [...assignments].sort(
    (a, b) => ASSIGNMENT_ORDER[a.status] - ASSIGNMENT_ORDER[b.status] || +new Date(a.due) - +new Date(b.due),
  );

  function toggle(id: string) {
    setOpenId((cur) => (cur === id ? null : id));
    setText("");
  }

  function submit(e: FormEvent, id: string) {
    e.preventDefault();
    if (!text.trim()) return;
    workspace.submitAssignment(id, text.trim());
    setOpenId(null);
    setText("");
  }

  return (
    <AssignmentsComponent
      loading={loading}
      assignments={sorted}
      openId={openId}
      text={text}
      onToggle={toggle}
      onTextChange={setText}
      onSubmit={submit}
      onCancel={() => setOpenId(null)}
    />
  );
}

export default AssignmentsContainer;
