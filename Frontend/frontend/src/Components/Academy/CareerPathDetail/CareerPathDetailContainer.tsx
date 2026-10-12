import { useParams } from "react-router-dom";
import CareerPathDetailComponent from "./CareerPathDetailComponent";
import Breadcrumb from "../Shared/Breadcrumb";
import CatalogState from "../Shared/CatalogState";
import { useCareerPath } from "../../../hooks/academyHooks/useCareerPathsApi";
import useSyllabusDownload from "../../../hooks/academyHooks/useSyllabusDownload";

function CareerPathDetailContainer() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error, reload } = useCareerPath(slug);
  const syllabus = useSyllabusDownload(
    slug ? `/api/career-paths/${encodeURIComponent(slug)}/syllabus` : undefined,
    `${slug ?? "career-path"}-syllabus.pdf`,
  );

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

  return (
    <CareerPathDetailComponent
      path={data}
      onDownloadSyllabus={syllabus.download}
      syllabusLoading={syllabus.loading}
      syllabusFeedback={syllabus.feedback}
    />
  );
}

export default CareerPathDetailContainer;
