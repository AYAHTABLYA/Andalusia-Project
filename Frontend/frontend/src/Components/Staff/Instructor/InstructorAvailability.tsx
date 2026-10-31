import WorkspaceTableComponent from "../Shared/WorkspaceTable/WorkspaceTableComponent";

const COLUMNS = ["Day", "Available from", "Available to", "Timezone", "Status"];

// /instructor/availability: the instructor owns their working windows; the Coordinator schedules inside them.
// The backend has no availability endpoint yet, so this page is an honest empty state with no dead buttons.
export default function InstructorAvailability() {
  return (
    <WorkspaceTableComponent
      eyebrow="TEACHING WORKSPACE"
      title="My availability"
      subtitle="Set the teaching windows coordinators can use when arranging sessions."
      icon="event_available"
      stats={[
        { label: "Available windows", icon: "event_available" },
        { label: "Booked windows", icon: "event_busy" },
        { label: "Upcoming sessions", icon: "calendar_month" },
      ]}
      columns={COLUMNS}
      rows={[]}
      query=""
      onQueryChange={() => undefined}
      onReset={() => undefined}
      emptyNote="Availability is provided by the instructor; coordinators schedule sessions within these windows. Saving will be enabled once the availability API exists."
    />
  );
}
