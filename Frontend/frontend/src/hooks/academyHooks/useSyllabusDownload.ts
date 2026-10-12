import { useState } from "react";
import { ApiError, downloadFile } from "../../apis/academyApi";

type SyllabusState = {
  loading: boolean;
  feedback: { kind: "success" | "error"; text: string } | null;
};

// Wraps GET /api/{programs|courses|career-paths}/{slug}/syllabus.
// Programs and career paths currently return 404 on the backend (no stored file yet),
// so the 404 is turned into a friendly message instead of a raw error page.
function useSyllabusDownload(path: string | undefined, fallbackName: string) {
  const [state, setState] = useState<SyllabusState>({ loading: false, feedback: null });

  async function download() {
    if (!path || state.loading) return;
    setState({ loading: true, feedback: null });
    try {
      await downloadFile(path, fallbackName);
      setState({ loading: false, feedback: { kind: "success", text: "Syllabus downloaded." } });
    } catch (err) {
      const text =
        err instanceof ApiError && err.status === 404
          ? "The syllabus is not available for download yet."
          : err instanceof ApiError
            ? err.message
            : "Could not download the syllabus.";
      setState({ loading: false, feedback: { kind: "error", text } });
    }
  }

  return { download, loading: state.loading, feedback: state.feedback };
}

export default useSyllabusDownload;
