import { useState } from "react";
import { useParams } from "react-router-dom";
import ProgramDetailComponent from "./ProgramDetailComponent";
import Breadcrumb from "../Shared/Breadcrumb";
import CatalogState from "../Shared/CatalogState";
import ApplyDialog from "../Shared/ApplyDialog";
import { ApiError, isLoggedIn } from "../../../apis/academyApi";
import { applyToProgram, useProgram } from "../../../hooks/academyHooks/useProgramsApi";
import useSyllabusDownload from "../../../hooks/academyHooks/useSyllabusDownload";

type ApplyState = {
  status: "idle" | "submitting" | "success" | "error";
  errorText?: string;
  needsLogin?: boolean;
};

function ProgramDetailContainer() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error, reload } = useProgram(slug);
  const syllabus = useSyllabusDownload(
    slug ? `/api/programs/${encodeURIComponent(slug)}/syllabus` : undefined,
    `${slug ?? "program"}-syllabus.pdf`,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [applyState, setApplyState] = useState<ApplyState>({ status: "idle" });

  function openDialog() {
    // Programs require an authenticated user (the endpoint returns 401 without a JWT).
    setApplyState({ status: "idle", needsLogin: !isLoggedIn() });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setApplyState({ status: "idle" });
  }

  async function handleSubmit() {
    if (!slug) return;
    setApplyState({ status: "submitting" });
    try {
      await applyToProgram(slug);
      setApplyState({ status: "success" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setApplyState({ status: "idle", needsLogin: true });
      } else if (err instanceof ApiError && err.status === 404) {
        setApplyState({
          status: "error",
          errorText: "This program is not currently open for applications.",
        });
      } else {
        setApplyState({
          status: "error",
          errorText: err instanceof ApiError ? err.message : "Could not submit your application.",
        });
      }
    }
  }

  if (!data) {
    return (
      <div className="program-detail_box-1">
        <Breadcrumb bar items={[{ label: "Academic Home", to: "/" }, { label: "Programs", to: "/programs" }, { label: slug ?? "Program" }]} />
        <div className="detail-state_wrap">
          {loading ? (
            <CatalogState kind="loading" rows={1} />
          ) : error?.status === 404 ? (
            <CatalogState kind="notfound" title="Program not found" text="This program does not exist or is no longer available." />
          ) : (
            <CatalogState kind="error" title="Could not load this program" text={error?.message} actionLabel="Retry" onAction={reload} />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <ProgramDetailComponent
        program={data}
        onApply={openDialog}
        onDownloadSyllabus={syllabus.download}
        syllabusLoading={syllabus.loading}
        syllabusFeedback={syllabus.feedback}
      />
      {dialogOpen && (
        <ApplyDialog
          title={`Apply: ${data.title}`}
          description="Confirm to submit your application for this program using your account details."
          mode={applyState.needsLogin ? "login-required" : "confirm"}
          status={applyState.status}
          errorText={applyState.errorText}
          successText="Application submitted. Our admissions team will contact you."
          onSubmit={handleSubmit}
          onClose={closeDialog}
        />
      )}
    </>
  );
}

export default ProgramDetailContainer;
