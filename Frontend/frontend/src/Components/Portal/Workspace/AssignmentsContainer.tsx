import { type FormEvent, useState } from "react";
import { getErrorMessage } from "../../../apis/academyApi";
import useWorkspace from "../../../hooks/workspaceHooks/useWorkspace";
import AssignmentsComponent from "./AssignmentsComponent";
import { ASSIGNMENT_ORDER } from "./constants";

function AssignmentsContainer() {
  const { workspace } = useWorkspace();
  const { assignments, loading } = workspace;
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unfinished first, then submitted, then graded; soonest due date first inside each group.
  const sorted = [...assignments].sort(
    (a, b) => ASSIGNMENT_ORDER[a.status] - ASSIGNMENT_ORDER[b.status] || +new Date(a.due) - +new Date(b.due),
  );

  function toggle(id: string) {
    setOpenId((cur) => (cur === id ? null : id));
    setText("");
    setError(null);
  }

  async function submit(e: FormEvent, id: string) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await workspace.submitAssignment(id, text.trim());
      setOpenId(null);
      setText("");
    } catch (err) {
      // Keep the form open with the learner's text so nothing is lost.
      setError(getErrorMessage(err, "Could not submit your work. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AssignmentsComponent
      loading={loading}
      assignments={sorted}
      openId={openId}
      text={text}
      submitting={submitting}
      error={error}
      onToggle={toggle}
      onTextChange={setText}
      onSubmit={submit}
      onCancel={() => toggle(openId ?? "")}
    />
  );
}

export default AssignmentsContainer;
