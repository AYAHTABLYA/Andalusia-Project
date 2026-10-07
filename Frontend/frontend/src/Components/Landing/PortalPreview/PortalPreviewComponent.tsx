import { memo } from "react";
import type { PortalTab } from "../../../Types/PortalTab";
import "./style.css";

function PortalPreviewComponent({
  activeTab,
  switchPortalTab,
}: {
  activeTab: PortalTab;
  switchPortalTab: (tab: PortalTab) => void;
}) {
  return (
    <section
      className="portal-preview"
      data-purpose="portal-switcher"
      id="portal-preview-section"
    >
      <div className="section-wrap">
        <div className="portal-preview_head">
          <span className="portal-preview_tag">Discover the Platform</span>
          <h2 className="heading-serif">Choose Your Portal</h2>
          <p>
            Explore how Andalusia Academy supports every stakeholder — students,
            instructors, coordinators, and administrators — with a dedicated
            portal experience.
          </p>
        </div>

        <div className="portal-preview_tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={
              "portal-preview_tab" +
              (activeTab === "student" ? " portal-preview_tab--active" : "")
            }
            onClick={() => switchPortalTab("student")}
          >
            Student Portal
          </button>
          <button
            type="button"
            role="tab"
            className={
              "portal-preview_tab" +
              (activeTab === "instructor" ? " portal-preview_tab--active" : "")
            }
            onClick={() => switchPortalTab("instructor")}
          >
            Instructor Portal
          </button>
          <button
            type="button"
            role="tab"
            className={
              "portal-preview_tab" +
              (activeTab === "coordinator" ? " portal-preview_tab--active" : "")
            }
            onClick={() => switchPortalTab("coordinator")}
          >
            Coordinator Portal
          </button>
          <button
            type="button"
            role="tab"
            className={
              "portal-preview_tab" +
              (activeTab === "admin" ? " portal-preview_tab--active" : "")
            }
            onClick={() => switchPortalTab("admin")}
          >
            Admin Portal
          </button>
        </div>

        {activeTab === "student" && (
          <div className="portal-preview_panel card">
            <div className="portal-preview_panel-head">
              <div className="portal-preview_person">
                <div className="portal-preview_avatar">AS</div>
                <div>
                  <h3>Ahmed Samy</h3>
                  <p>
                    Track: Executive FinTech &amp; Payment Architecture • Cohort
                    03
                  </p>
                </div>
              </div>
              <div className="portal-preview_stats">
                <div>
                  <span>Attendance Record</span>
                  <strong className="portal-preview_stat--emerald">
                    92% In-Person Verified
                  </strong>
                </div>
                <span className="portal-preview_divider" />
                <div>
                  <span>Lab Progress</span>
                  <strong className="portal-preview_stat--primary">
                    7 / 8 Completed
                  </strong>
                </div>
              </div>
            </div>

            <div className="portal-preview_grid">
              <div className="portal-preview_box">
                <span className="portal-preview_box-tag">
                  Next Offline Class
                </span>
                <h4>Open Banking API Integration Workshop</h4>
                <p>Saturday, Nov 08 • 10:00 AM - 02:00 PM</p>
                <div className="portal-preview_box-note">
                  Alexandria Campus: Hall B (Bring Laptop &amp; Smart Badge)
                </div>
              </div>
              <div className="portal-preview_box">
                <span className="portal-preview_box-tag portal-preview_box-tag--dark">
                  Pending Assignment
                </span>
                <h4>Payment Gateway Idempotency Simulation</h4>
                <p>Due Date: Wednesday, 11:59 PM</p>
                <button type="button" className="portal-preview_upload-btn">
                  Upload GitHub Link
                </button>
              </div>
              <div className="portal-preview_box">
                <span className="portal-preview_box-tag portal-preview_box-tag--dark">
                  Cohort Discussion
                </span>
                <h4>Lead Mentor Feedback Received</h4>
                <p>
                  &quot;Great architectural diagram on Section 3. Minor fix
                  needed on database replica failover.&quot;
                </p>
                <a href="#">Read Mentor Notes →</a>
              </div>
            </div>
          </div>
        )}

        {activeTab === "instructor" && (
          <div className="portal-preview_panel card">
            <div className="portal-preview_panel-head">
              <div className="portal-preview_person">
                <div className="portal-preview_avatar portal-preview_avatar--dark">
                  DR
                </div>
                <div>
                  <h3>Dr. Tarek Mansour</h3>
                  <p>
                    Department: Applied Machine Learning &amp; Data Sciences
                  </p>
                </div>
              </div>
              <div className="portal-preview_instructor-actions">
                <span className="portal-preview_submissions">
                  Submissions To Grade
                </span>
                <button type="button" className="portal-preview_qr-btn">
                  Record Attendance QR
                </button>
              </div>
            </div>

            <div className="portal-preview_grid">
              <div className="portal-preview_metric-box">
                <span>Active Cohort Roster</span>
                <strong>Cohort-04: Executive Generative AI</strong>
                <p>View the full class list and contact details</p>
              </div>
              <div className="portal-preview_metric-box">
                <span>Cohort Performance</span>
                <strong className="portal-preview_stat--emerald">
                  On Track
                </strong>
                <p>Based on completed practical assessments</p>
              </div>
              <div className="portal-preview_metric-box">
                <span>Campus Facility Reserved</span>
                <strong className="portal-preview_metric-box-sm">
                  Alexandria Lab 2 &amp; Audio Setup
                </strong>
                <p>Next session: Tuesday 06:00 PM</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "coordinator" && (
          <div className="portal-preview_panel card">
            <div className="portal-preview_panel-head">
              <div className="portal-preview_person">
                <div className="portal-preview_avatar portal-preview_avatar--amber">
                  MF
                </div>
                <div>
                  <h3>Mona Fathy</h3>
                  <p>
                    Program Coordinator • Academic Operations &amp; Scheduling
                  </p>
                </div>
              </div>
            </div>

            <div className="portal-preview_grid">
              <div className="portal-preview_box">
                <span className="portal-preview_box-tag">
                  Cohort Scheduling
                </span>
                <h4>Confirm Q4 Session Calendar</h4>
                <p>Align hall bookings with instructor availability</p>
                <div className="portal-preview_box-note">
                  Alexandria Campus: Halls A &amp; B
                </div>
              </div>
              <div className="portal-preview_box">
                <span className="portal-preview_box-tag portal-preview_box-tag--dark">
                  Instructor Assignments
                </span>
                <h4>Assign Faculty to New Tracks</h4>
                <p>Review mentor availability across upcoming cohorts</p>
                <button type="button" className="portal-preview_upload-btn">
                  Review Assignments
                </button>
              </div>
              <div className="portal-preview_box">
                <span className="portal-preview_box-tag portal-preview_box-tag--dark">
                  Curriculum Review
                </span>
                <h4>Pending Curriculum Update</h4>
                <p>
                  Faculty has proposed updates to the MLOps &amp; Governance
                  module.
                </p>
                <a href="#">Review Curriculum Notes →</a>
              </div>
            </div>
          </div>
        )}

        {activeTab === "admin" && (
          <div className="portal-preview_panel card">
            <div className="portal-preview_panel-head">
              <div className="portal-preview_person">
                <div className="portal-preview_avatar portal-preview_avatar--amber">
                  OP
                </div>
                <div>
                  <h3>Alexandria Campus Operations</h3>
                  <p>
                    Oversee facilities, enrollment, and platform administration
                    across the Alexandria campus.
                  </p>
                </div>
              </div>
            </div>

            <div className="portal-preview_capability-grid">
              <div className="portal-preview_capability">
                <span className="portal-preview_capability-icon">🏫</span>
                <div>
                  <strong>Facility Management</strong>
                  <p>Coordinate lecture halls, labs, and equipment bookings</p>
                </div>
              </div>
              <div className="portal-preview_capability">
                <span className="portal-preview_capability-icon">📋</span>
                <div>
                  <strong>Enrollment Oversight</strong>
                  <p>Review applications and manage cohort placements</p>
                </div>
              </div>
              <div className="portal-preview_capability">
                <span className="portal-preview_capability-icon">💳</span>
                <div>
                  <strong>Tuition &amp; Finance</strong>
                  <p>Track payments, installments, and refund requests</p>
                </div>
              </div>
              <div className="portal-preview_capability">
                <span className="portal-preview_capability-icon">⚙️</span>
                <div>
                  <strong>Portal Administration</strong>
                  <p>Manage accounts and permissions across every portal</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(PortalPreviewComponent);
