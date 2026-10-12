import { useMemo, useState } from "react";
import ProfileComponent from "./ProfileComponent";
import useProfile from "../../../hooks/portalHooks/useProfile";
import usePortalContext from "../../../hooks/portalHooks/usePortalContext";
import type { EditableProfile, ProfileData } from "../../../Types/Profile";

function ProfileContainer() {
  const { showToast } = usePortalContext();
  const { data, loading, error, reload } = useProfile();

  const [edits, setEdits] = useState<Partial<EditableProfile>>({});
  const [editing, setEditing] = useState(false);

  const profile = useMemo<ProfileData | null>(
    () => (data ? { ...data, ...edits } : null),
    [data, edits],
  );

  // TODO: POST/PUT the changes to the API; for now they only live in this session.
  function handleSave(values: EditableProfile) {
    setEdits(values);
    setEditing(false);
    showToast("Profile details updated.");
  }

  return (
    <ProfileComponent
      profile={profile}
      loading={loading && !data}
      errorMessage={error?.message}
      editing={editing}
      onEdit={() => setEditing(true)}
      onCloseEdit={() => setEditing(false)}
      onSave={handleSave}
      onRetry={reload}
      onNotify={showToast}
    />
  );
}

export default ProfileContainer;
