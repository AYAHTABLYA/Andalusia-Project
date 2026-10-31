import { memo } from "react";
import type { WorkspaceCourse, WorkspaceMaterial } from "../../../Types/Workspace";
import EmptyState from "./EmptyState";
import { fmtDate } from "./helpers";

type MaterialGroup = { course: WorkspaceCourse; items: WorkspaceMaterial[] };
type Props = { loading: boolean; groups: MaterialGroup[] };

const ICONS: Record<string, string> = {
  pdf: "picture_as_pdf",
  video: "smart_display",
  mp4: "smart_display",
  link: "link",
  slides: "slideshow",
  ppt: "slideshow",
  pptx: "slideshow",
  doc: "description",
  docx: "description",
  audio: "headphones",
  mp3: "headphones",
};
const iconFor = (kind: string) => ICONS[kind] ?? "draft";

function MaterialsComponent({ loading, groups }: Props) {
  return (
    <>
      <header className="ws_head">
        <span className="portal-eyebrow">COURSE CONTENT</span>
        <h1>Materials</h1>
        <p>Files, links and recordings shared by your instructors.</p>
      </header>

      {loading ? (
        <div className="portal-card ws_pad">Loading…</div>
      ) : groups.length === 0 ? (
        <div className="portal-card">
          <EmptyState icon="folder_open" title="No materials yet" text="Course materials will show up here once they are published." />
        </div>
      ) : (
        groups.map(({ course, items }) => (
          <div className="portal-card ws_pad0" key={course.id} style={{ marginBottom: "1rem" }}>
            <h2 className="ws_pad" style={{ margin: 0 }}>{course.title}</h2>
            <ul className="ws_assign">
              {items.map((m) => (
                <li key={m.id}>
                  <div className="ws_assign-row">
                    <span className="ws_assign-icon material-symbols-outlined">{iconFor(m.kind)}</span>
                    <div className="ws_assign-main">
                      <strong>{m.title}</strong>
                      {m.description && <small>{m.description}</small>}
                      {m.addedAt && <small>{`Added ${fmtDate(m.addedAt)}`}</small>}
                    </div>
                    <span className="ws_tag">{m.kind.toUpperCase()}</span>
                    {m.url ? (
                      <a className="portal-btn portal-btn-primary" href={m.url} target="_blank" rel="noopener noreferrer">Open</a>
                    ) : (
                      <span className="ws_muted">Unavailable</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </>
  );
}

export type { MaterialGroup };
export default memo(MaterialsComponent);
