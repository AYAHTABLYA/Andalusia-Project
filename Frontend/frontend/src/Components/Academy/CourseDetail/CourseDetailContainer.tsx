import { useState } from "react";
import { useParams } from "react-router-dom";
import CourseDetailComponent from "./CourseDetailComponent";
import Breadcrumb from "../Shared/Breadcrumb";
import CatalogState from "../Shared/CatalogState";
import ApplyDialog from "../Shared/ApplyDialog";
import type { ApplyFormValues } from "../Shared/ApplyDialog";
import { ApiError, isLoggedIn } from "../../../apis/academyApi";
import { applyToCourse, useCourse } from "../../../hooks/academyHooks/useCoursesApi";
import useSyllabusDownload from "../../../hooks/academyHooks/useSyllabusDownload";

type ApplyState = { status: "idle" | "submitting" | "success" | "error"; errorText?: string };

function CourseDetailContainer() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error, reload } = useCourse(slug);
  const syllabus = useSyllabusDownload(
    slug ? `/api/courses/${encodeURIComponent(slug)}/syllabus` : undefined,
    `${slug ?? "course"}-syllabus.pdf`,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [applyState, setApplyState] = useState<ApplyState>({ status: "idle" });

  function closeDialog() {
    setDialogOpen(false);
    setApplyState({ status: "idle" });
  }

  async function handleSubmit(values: ApplyFormValues) {
    if (!slug) return;
    setApplyState({ status: "submitting" });
    try {
      await applyToCourse(slug, {
        fullName: values.fullName.trim() || undefined,
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
        message: values.message.trim() || undefined,
      });
      setApplyState({ status: "success" });
    } catch (err) {
      setApplyState({
        status: "error",
        errorText: err instanceof ApiError ? err.message : "Could not submit your application.",
      });
    }
  }

  if (!data) {
    return (
      <div className="course-detail_box-1">
        <Breadcrumb bar items={[{ label: "Academic Home", to: "/" }, { label: "Courses", to: "/courses" }, { label: slug ?? "Course" }]} />
        <div className="detail-state_wrap">
          {loading ? (
            <CatalogState kind="loading" rows={1} />
          ) : error?.status === 404 ? (
            <CatalogState kind="notfound" title="Course not found" text="This course does not exist or is no longer available." />
          ) : (
            <CatalogState kind="error" title="Could not load this course" text={error?.message} actionLabel="Retry" onAction={reload} />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <CourseDetailComponent
        course={data}
        onApply={() => setDialogOpen(true)}
        onDownloadSyllabus={syllabus.download}
        syllabusLoading={syllabus.loading}
        syllabusFeedback={syllabus.feedback}
      />
      {dialogOpen && (
        <ApplyDialog
          title={`Apply: ${data.title}`}
          description="Our admissions team will review your application and contact you."
          mode={isLoggedIn() ? "message-only" : "guest-form"}
          status={applyState.status}
          errorText={applyState.errorText}
          successText="Application submitted. We will contact you shortly."
          onSubmit={handleSubmit}
          onClose={closeDialog}
        />
      )}
    </>
  );
}

export default CourseDetailContainer;
