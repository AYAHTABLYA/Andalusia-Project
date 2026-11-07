import { memo } from "react";
import { Link } from "react-router-dom";
import type { OpsAction } from "../../Staff/Shared/OpsBar";
import OverviewView, { type ActivityRow, type SessionRow, type Stat } from "../../Staff/Shared/OverviewView";
import { OverviewHero, OverviewProfile, type Tile } from "../../Staff/Shared/OverviewHero";
import { BarChart, ChartCard, DonutChart, type BarDatum, type Segment } from "../../Charts/Charts";
import Constellation, { type SceneNode } from "../../Shared/Constellation/Constellation";
import EmptyState from "./EmptyState";

type Props = {
  loading: boolean;
  hasCourses: boolean;
  name: string;
  email?: string;
  role: string;
  photoUrl?: string | null;
  tiles: Tile[];
  subtitle: string;
  pulse?: string;
  stats: Stat[];
  sessions: SessionRow[];
  upcomingCount: number;
  materials: ActivityRow[];
  actions: OpsAction[];
  courseBars: BarDatum[];
  assignmentSegments: Segment[];
  attendanceSegments: Segment[];
  sceneNodes: SceneNode[];
  overall: number; // overall course progress, shown in the middle of the 3D scene
};

const total = (segments: Segment[]) => segments.reduce((n, s) => n + s.value, 0);

// Student overview: the same layout as the Admin / Coordinator / Instructor overviews
// (banner + profile card, 3D scene, stat cards, charts, schedule + activity cards, quick actions).
function OverviewComponent({
  loading, hasCourses, name, email, role, photoUrl, tiles, subtitle, pulse, stats, sessions, upcomingCount, materials,
  actions, courseBars, assignmentSegments, attendanceSegments, sceneNodes, overall,
}: Props) {
  // Nothing to show until the learner has an active enrollment: keep the banner + profile, explain the rest.
  if (!loading && !hasCourses) {
    return (
      <>
        <div className="ov-top">
          <OverviewHero
            workspace="STUDENT WORKSPACE"
            name={name}
            subtitle="Your workspace fills in as soon as you have an active enrollment."
            cta={{ label: "View my enrollments", to: "/enrollments" }}
          />
          <OverviewProfile name={name} email={email} role={role} photoUrl={photoUrl} tiles={tiles} />
        </div>
        <section className="staff-card">
          <EmptyState
            icon="school"
            title="No active enrollment yet"
            text="Once a program or course is confirmed for you, your sessions, assignments and materials will appear here."
          />
          <div className="ws_center">
            <Link className="staff-btn" to="/courses">Browse courses</Link>
          </div>
        </section>
      </>
    );
  }

  const scene = (
    <Constellation
      title="Your learning universe"
      subtitle="Each node is a course and the ring shows your progress. Drag to rotate."
      centerLabel="overall progress"
      centerValue={loading ? undefined : `${overall}%`}
      nodes={sceneNodes}
      loading={loading}
      empty="Your courses will appear here once the API responds."
      footnote="Dots around a course are its sessions."
    />
  );

  const assignmentCount = total(assignmentSegments);
  const attendanceCount = total(attendanceSegments);
  const charts = (
    <>
      <ChartCard title="Progress by course" subtitle="Completion %" empty={!loading && courseBars.length === 0 ? "No active courses." : undefined}>
        <BarChart data={courseBars} unit="%" ariaLabel="Progress percentage per course" />
      </ChartCard>
      <ChartCard title="Assignments" subtitle="By status" empty={!loading && assignmentCount === 0 ? "No assignments yet." : undefined}>
        <DonutChart segments={assignmentSegments} centerValue={assignmentCount} centerLabel="assignments" ariaLabel="Assignments by status" />
      </ChartCard>
      <ChartCard title="Attendance" subtitle="Recorded sessions" empty={!loading && attendanceCount === 0 ? "No attendance recorded yet." : undefined}>
        <DonutChart segments={attendanceSegments} centerValue={attendanceCount} centerLabel="sessions" ariaLabel="Attendance by status" />
      </ChartCard>
    </>
  );

  return (
    <OverviewView
      name={name}
      email={email}
      role={role}
      photoUrl={photoUrl}
      workspace="STUDENT WORKSPACE"
      tiles={tiles}
      subtitle={subtitle}
      pulse={pulse}
      scene={scene}
      stats={stats}
      charts={charts}
      sessions={sessions}
      sessionsTitle="Your next sessions"
      sessionsSub={`${upcomingCount} upcoming session${upcomingCount === 1 ? "" : "s"}`}
      emptySessions="Nothing scheduled yet. New sessions will show up here."
      scheduleLink="/workspace/schedule"
      activity={materials}
      activityTitle="New materials"
      activitySub="Latest from your courses"
      emptyActivity="No materials yet. Files your instructors share will appear here."
      activityLink={{ label: "See all materials", to: "/workspace/materials" }}
      actions={actions}
      loading={loading}
    />
  );
}

export default memo(OverviewComponent);
