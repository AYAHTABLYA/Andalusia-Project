import { useState } from "react";
import { useParams } from "react-router-dom";
import CareerPathDetailComponent from "./CareerPathDetailComponent";
import Breadcrumb from "../Shared/Breadcrumb";
import CatalogState from "../Shared/CatalogState";
import ApplyDialog from "../Shared/ApplyDialog";
import type { ApplyFormValues } from "../Shared/ApplyDialog";
import { ApiError, getErrorMessage } from "../../../apis/academyApi";
import { getStoredUser } from "../../../utils/session";
import { submitContactEnquiry } from "../../../hooks/academyHooks/useContactApi";
import { useCareerPath } from "../../../hooks/academyHooks/useCareerPathsApi";
import useSyllabusDownload from "../../../hooks/academyHooks/useSyllabusDownload";

type ApplyState = {
  status: "idle" | "submitting" | "success" | "error";
  errorText?: string;
};

function CareerPathDetailContainer() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error, reload } = useCareerPath(slug);
  const syllabus = useSyllabusDownload(
    slug ? `/api/career-paths/${encodeURIComponent(slug)}/syllabus` : undefined,
    `${slug ?? "career-path"}-syllabus.pdf`,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [applyState, setApplyState] = useState<ApplyState>({ status: "idle" });

  function openDialog() {
    setApplyState({ status: "idle" });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setApplyState({ status: "idle" });
  }

  // Career paths have no application record of their own, so "apply" sends an admission-interview
  // request (POST /api/contact-enquiries, public) that names the career path. It works with or
  // without a signed-in account; when signed in, the name / email are pre-filled.
  async function handleApply(values: ApplyFormValues) {
    if (!data) return;
    setApplyState({ status: "submitting" });
    try {
      await submitContactEnquiry({
        fullName: values.fullName.trim(),
        mobileNumber: values.phone.trim(),
        email: values.email.trim() || undefined,
        // The backend keeps this inside the enquiry message (max 200 chars): career path + optional note.
        desiredTrack: (
          values.message.trim()
            ? `Career path: ${data.title} | Note: ${values.message.trim()}`
            : `Career path: ${data.title}`
        ).slice(0, 200),
      });
      setApplyState({ status: "success" });
    } catch (err) {
      setApplyState({
        status: "error",
        errorText:
          err instanceof ApiError && err.status === 429
            ? "Too many requests from this device. Please try again in a few minutes."
            : getErrorMessage(err, "We could not send your application. Please try again."),
      });
    }
  }

  if (!data) {
    return (
      <div className="career-path-detail_box-1">
        <Breadcrumb bar items={[{ label: "Academic Home", to: "/" }, { label: "Career Paths", to: "/career-paths" }, { label: slug ?? "Career Path" }]} />
        <div className="detail-state_wrap">
          {loading ? (
            <CatalogState kind="loading" rows={1} />
          ) : error?.status === 404 ? (
            <CatalogState kind="notfound" title="Career path not found" text="This career path does not exist or is no longer available." />
          ) : (
            <CatalogState kind="error" title="Could not load this career path" text={error?.message} actionLabel="Retry" onAction={reload} />
          )}
        </div>
      </div>
    );
  }

  const user = getStoredUser();

  return (
    <>
      <CareerPathDetailComponent
        path={data}
        onApply={openDialog}
        onDownloadSyllabus={syllabus.download}
        syllabusLoading={syllabus.loading}
        syllabusFeedback={syllabus.feedback}
      />
      {dialogOpen && (
        <ApplyDialog
          title={`Apply: ${data.title}`}
          description="Leave your details and our admissions team will contact you to schedule your executive path interview."
          mode="guest-form"
          phoneRequired
          initialValues={{ fullName: user?.name ?? "", email: user?.email ?? "" }}
          status={applyState.status}
          errorText={applyState.errorText}
          successText="Application received. Our admissions team will contact you to schedule your interview."
          onSubmit={handleApply}
          onClose={closeDialog}
        />
      )}
    </>
  );
}

export default CareerPathDetailContainer;
