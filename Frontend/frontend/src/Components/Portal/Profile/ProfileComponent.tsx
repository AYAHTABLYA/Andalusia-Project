import { memo } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../Academy/Shared/Breadcrumb";
import CatalogState from "../../Academy/Shared/CatalogState";
import EditProfileDialog from "./EditProfileDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";
import { NOTIFICATION_OPTIONS } from "./constants";
import { initials, resolveAssetUrl } from "../../../utils/format";
import type {
  ChangePasswordValues,
  EditableProfile,
  EnrollmentSummary,
  ProfileData,
  ProfileMetric,
} from "../../../Types/Profile";
import "../Shared/style.css";
import "./style.css";

type Props = {
  profile: ProfileData | null;
  metrics: ProfileMetric[];
  enrollment: EnrollmentSummary | null;
  loading: boolean;
  errorMessage?: string;
  editing: boolean;
  changingPassword: boolean;
  onEdit: () => void;
  onCloseEdit: () => void;
  onSave: (values: EditableProfile, photo: File | null) => Promise<void>;
  onChangePassword: () => void;
  onClosePassword: () => void;
  onSubmitPassword: (values: ChangePasswordValues) => Promise<void>;
  onRetry: () => void;
  onNotify: (message: string) => void;
};

function ProfileSkeleton() {
  return (
    <div className="profile_stack" aria-busy="true" aria-live="polite">
      <div className="portal-ui_skeleton profile_skeleton-hero" />
      <div className="profile_metrics">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="portal-ui_skeleton profile_skeleton-metric" />
        ))}
      </div>
      <div className="portal-ui_skeleton profile_skeleton-panel" />
    </div>
  );
}

function ProfileComponent({
  profile, metrics, enrollment, loading, errorMessage, editing, changingPassword,
  onEdit, onCloseEdit, onSave, onChangePassword, onClosePassword, onSubmitPassword,
  onRetry, onNotify,
}: Props) {
  return (
    <div className="profile">
      <Breadcrumb items={[{ label: "Student Workspace" }, { label: "Profile & Account Settings" }]} />

      {loading ? (
        <ProfileSkeleton />
      ) : errorMessage || !profile ? (
        <CatalogState
          kind="error"
          title="Could not load your profile"
          text={errorMessage}
          actionLabel="Retry"
          onAction={onRetry}
        />
      ) : (
        <div className="profile_stack">
          {/* 1. Hero */}
          <section className="portal-ui_card profile_hero">
            <div className="profile_hero-bar" />
            <div className="profile_hero-inner">
              <div className="profile_hero-id">
                <button type="button" className="profile_avatar" onClick={onEdit} aria-label="Edit profile">
                  {profile.photoUrl ? (
                    <img className="profile_avatar-img" src={resolveAssetUrl(profile.photoUrl) ?? ""} alt="" />
                  ) : (
                    <span className="profile_avatar-text">{initials(`${profile.firstName} ${profile.lastName}`)}</span>
                  )}
                  <span className="profile_avatar-overlay">
                    <span className="material-symbols-outlined">edit</span>
                    Edit
                  </span>
                </button>

                <div className="profile_hero-text">
                  <div className="profile_hero-title">
                    <h1>{profile.firstName} {profile.lastName}</h1>
                    <span className="portal-ui_pill portal-ui_pill--brand">
                      <span className="profile_dot" />
                      Active Student
                    </span>
                    <span className="portal-ui_pill portal-ui_pill--warning">ID: {profile.studentId}</span>
                  </div>
                  <div className="profile_hero-meta">
                    <span><span className="material-symbols-outlined">alternate_email</span>{profile.email}</span>
                    <span><span className="material-symbols-outlined">calendar_today</span>Member since: {profile.memberSince}</span>
                  </div>
                  <div className="profile_hero-badges">
                    <span className="portal-ui_pill portal-ui_pill--muted">
                      <span className="material-symbols-outlined">school</span>
                      Executive Fellowship
                    </span>
                    <span className="portal-ui_pill portal-ui_pill--muted">
                      <span className="material-symbols-outlined">verified_user</span>
                      Pearson Assured &amp; CPD Registered
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile_hero-actions">
                <button type="button" className="portal-ui_btn portal-ui_btn--primary" onClick={onEdit}>
                  <span className="material-symbols-outlined">tune</span>
                  Edit Profile
                </button>
                <button
                  type="button"
                  className="portal-ui_btn portal-ui_btn--outline"
                  onClick={() => onNotify("Preparing your digital Student ID...")}
                >
                  <span className="material-symbols-outlined">badge</span>
                  Download Student ID
                </button>
              </div>
            </div>
          </section>

          {/* 2. Metrics */}
          {metrics.length > 0 && (
          <section className="profile_metrics" aria-label="Learning overview">
            {metrics.map((m) => (
              <article key={m.id} className="portal-ui_card profile_metric">
                <div className="profile_metric-top">
                  <span className="profile_metric-label">{m.label}</span>
                  <span className="profile_metric-icon">
                    <span className="material-symbols-outlined">{m.icon}</span>
                  </span>
                </div>
                <div className="profile_metric-body">
                  <div className="profile_metric-value">
                    {m.value}
                    {m.valueNote && <small>{m.valueNote}</small>}
                  </div>
                  {m.progress !== undefined && (
                    <div className="profile_bar">
                      <span style={{ width: `${m.progress}%` }} />
                    </div>
                  )}
                  <p className="profile_metric-caption">{m.caption}</p>
                </div>
                <div className="profile_metric-foot">
                  <span>{m.footerLeft}</span>
                  {m.footerRight && <span>{m.footerRight}</span>}
                </div>
              </article>
            ))}
          </section>
          )}

          {/* 3. Personal info + enrollment */}
          <div className="profile_columns">
            <section className="portal-ui_card profile_panel profile_panel--info" aria-label="Personal details">
              <div className="profile_panel-head">
                <div className="profile_panel-title">
                  <span className="material-symbols-outlined">badge</span>
                  <h2>Personal Information</h2>
                </div>
                <span className="profile_panel-note">Verified Record</span>
              </div>
              <dl className="profile_dl">
                <div><dt>Full Legal Name</dt><dd>{profile.firstName} {profile.lastName}</dd></div>
                <div><dt>Professional Title</dt><dd>{profile.title || "—"}</dd></div>
                <div><dt>Email</dt><dd className="profile_mono">{profile.email}</dd></div>
                <div><dt>Direct Mobile</dt><dd>{profile.phone || "—"}</dd></div>
                <div>
                  <dt>Primary Campus</dt>
                  <dd className="profile_dd-icon">
                    <span className="material-symbols-outlined">location_on</span>
                    {profile.campus}
                  </dd>
                </div>
                <div>
                  <dt>Instructional Languages</dt>
                  <dd className="profile_langs">
                    <span>English</span>
                    <span>Arabic</span>
                  </dd>
                </div>
              </dl>
              <button type="button" className="portal-ui_btn portal-ui_btn--outline profile_panel-btn" onClick={onEdit}>
                <span className="material-symbols-outlined">edit_note</span>
                Update Personal Info
              </button>
            </section>

            {enrollment ? (
            <section className="portal-ui_card profile_panel profile_panel--enroll" aria-label="Current enrollment">
              <div className="profile_panel-head">
                <div className="profile_panel-title">
                  <span className="material-symbols-outlined">school</span>
                  <h2>Current Enrolled Program</h2>
                </div>
                <span className="portal-ui_pill portal-ui_pill--warning">{enrollment.status}</span>
              </div>

              <div className="profile_program">
                <span className="profile_eyebrow">Program</span>
                <h3>{enrollment.degree}</h3>
                <p>{enrollment.accreditation}</p>
              </div>

              <div className="profile_module">
                <div className="profile_module-top">
                  <div>
                    <span className="profile_module-label">Active Term Module</span>
                    <h4>{enrollment.module}</h4>
                  </div>
                  <span className="profile_module-progress">{enrollment.progress}% Done</span>
                </div>
                <div className="profile_module-grid">
                  <div>
                    <span>Lead Mentor</span>
                    <strong><span className="material-symbols-outlined">person</span>{enrollment.mentor}</strong>
                  </div>
                  <div>
                    <span>Upcoming Physical Session</span>
                    <strong><span className="material-symbols-outlined">event</span>{enrollment.nextSession}</strong>
                  </div>
                </div>
                <div className="profile_deliverable">
                  <span>
                    <span className="material-symbols-outlined">timer</span>
                    Next Deliverable: <strong>{enrollment.deliverable}</strong>
                  </span>
                  <b>{enrollment.deliverableDue}</b>
                </div>
              </div>

              <div className="profile_enroll-actions">
                <Link to="/payments" className="portal-ui_btn portal-ui_btn--primary">
                  <span className="material-symbols-outlined">receipt_long</span>
                  View Tuition &amp; Financial Ledger
                </Link>
                <button
                  type="button"
                  className="portal-ui_btn portal-ui_btn--outline"
                  onClick={() => onNotify("Syllabus download started.")}
                >
                  <span className="material-symbols-outlined">description</span>
                  View Course Syllabus
                </button>
              </div>
            </section>
            ) : (
            <section className="portal-ui_card profile_panel profile_panel--enroll" aria-label="Current enrollment">
              <div className="profile_panel-head">
                <div className="profile_panel-title">
                  <span className="material-symbols-outlined">school</span>
                  <h2>Current Enrolled Program</h2>
                </div>
              </div>
              <p>You are not enrolled in a program yet.</p>
              <div className="profile_enroll-actions">
                <Link to="/programs" className="portal-ui_btn portal-ui_btn--primary">
                  <span className="material-symbols-outlined">search</span>
                  Browse Programs
                </Link>
              </div>
            </section>
            )}
          </div>

          {/* 4. Security & notifications */}
          <section className="portal-ui_card profile_panel" aria-label="Security and privacy">
            <div className="profile_panel-head">
              <div className="profile_panel-title">
                <span className="material-symbols-outlined">shield</span>
                <h2>Account, Security &amp; Privacy</h2>
              </div>
              <span className="profile_secure">
                <span className="material-symbols-outlined">check_circle</span>
                Signed in
              </span>
            </div>

            <div className="profile_security">
              <div className="profile_security-col">
                <h3>Credentials</h3>
                <div className="profile_box">
                  <div className="profile_box-row"><strong>Portal Password</strong></div>
                  <p>Use a strong, unique password you don&apos;t use anywhere else.</p>
                  <button
                    type="button"
                    className="portal-ui_btn portal-ui_btn--outline portal-ui_btn--sm"
                    onClick={onChangePassword}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="profile_security-col">
                <h3>Cohort Notifications</h3>
                {NOTIFICATION_OPTIONS.map((n) => (
                  <label key={n.id} className="profile_toggle">
                    <span>
                      <strong>{n.title}</strong>
                      <small>{n.text}</small>
                    </span>
                    <input type="checkbox" defaultChecked />
                  </label>
                ))}
              </div>

              <div className="profile_security-col">
                <h3>Accreditation Data Sync</h3>
                <div className="profile_box profile_box--soft">
                  <div className="profile_box-row">
                    <span className="material-symbols-outlined">sync</span>
                    <strong>Pearson CPD Transcript Sync</strong>
                  </div>
                  <p>Grade validation with the UK Pearson registry. No external marketing data sharing.</p>
                </div>
                <button
                  type="button"
                  className="profile_link-btn"
                  onClick={() => onNotify("Transcript request queued. The registrar has been notified.")}
                >
                  Request Archival Data Packet &amp; Transcript Export
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {editing && profile && (
        <EditProfileDialog profile={profile} onClose={onCloseEdit} onSave={onSave} />
      )}
      {changingPassword && (
        <ChangePasswordDialog onClose={onClosePassword} onSubmit={onSubmitPassword} />
      )}
    </div>
  );
}

export default memo(ProfileComponent);
