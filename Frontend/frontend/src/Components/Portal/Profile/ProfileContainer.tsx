import { useState } from "react";
import ProfileComponent from "./ProfileComponent";
import useProfile from "../../../hooks/portalHooks/useProfile";
import useDashboard from "../../../hooks/portalHooks/useDashboard";
import usePortalContext from "../../../hooks/portalHooks/usePortalContext";
import { changePassword, updateProfile, uploadProfilePhoto } from "../../../apis/portalApi";
import { getStoredUser, updateStoredUser } from "../../../utils/session";
import type { ChangePasswordValues, EditableProfile } from "../../../Types/Profile";

function ProfileContainer() {
  const { showToast } = usePortalContext();
  const { data: profile, loading, error, reload } = useProfile();
  const { data: dashboard } = useDashboard();

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // PUT /api/profile  (errors bubble up to the dialog, which shows them)
  async function handleSave(values: EditableProfile, photo: File | null) {
    // POST /api/profile/photo (only when a new picture was chosen)
    let photoUrl: string | null | undefined;
    if (photo) {
      const res = (await uploadProfilePhoto(photo)) as Record<string, any> | null;
      photoUrl =
        res?.profileImageUrl ?? res?.ProfileImageUrl ?? res?.photoUrl ?? res?.PhotoUrl ?? res?.url ?? res?.Url ?? null;
    }

    await updateProfile({
      firstName: values.firstName,
      lastName: values.lastName,
      title: values.title,
      mobileNumber: values.phone,
      campusId: values.campusId,
    });

    // keep the name in the header in sync
    const stored = getStoredUser();
    if (stored) {
      updateStoredUser({
        ...stored,
        name: `${values.firstName} ${values.lastName}`.trim(),
        ...(photoUrl ? { photoUrl } : {}),
      });
    }

    setEditing(false);
    reload();
    showToast("Profile details updated.");
  }

  // PUT /api/profile/change-password
  async function handleChangePassword(values: ChangePasswordValues) {
    await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.newPassword,
    });
    setChangingPassword(false);
    showToast("Password changed successfully.");
  }

  return (
    <ProfileComponent
      profile={profile}
      metrics={dashboard?.metrics ?? []}
      enrollment={dashboard?.enrollment ?? null}
      loading={loading && !profile}
      errorMessage={error?.message}
      editing={editing}
      changingPassword={changingPassword}
      onEdit={() => setEditing(true)}
      onCloseEdit={() => setEditing(false)}
      onSave={handleSave}
      onChangePassword={() => setChangingPassword(true)}
      onClosePassword={() => setChangingPassword(false)}
      onSubmitPassword={handleChangePassword}
      onRetry={reload}
      onNotify={showToast}
    />
  );
}

export default ProfileContainer;
