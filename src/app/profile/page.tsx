"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

  // Defines the structure of fetched profileDB entry 
  interface UserProfile {
  name: string;
  email: string;
  sex: string;
  age: number;
  height: number;
  weight: number;
  diabetesType: string;
  targetWeight: number;
  activityLevel: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Holds the user's profile data
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  // Holds any error message during fetch
  const [error, setError] = useState("");

  // Redirects unauthenticated users away from profile page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  // fetchProfile: Sends a GET request to /api/profile to retrieve user data
  const fetchProfile = async () => {
    try {
      const profileResponse = await fetch("/api/profile");
      const data = await profileResponse.json();

      setProfileData(data.user);
    } catch {
      setError("Could not Fetch User Profile");
    }
  };

  if (!session) return null;

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch {
      setError("Failed to log out. Try again.");
    }
  };

  // Sends a PUT request to update profile fields
  const updateField = async (fieldName: keyof UserProfile, newValue: string | number) => {
    if (!profileData) return;

    try {
      const updateResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldName]: newValue }),
      });
      const data = await updateResponse.json();

      setProfileData(data.user);
    } catch {
      setError("Couldnt not fetch field to update.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          My Profile
        </h1>
        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4">
            {error}
          </div>
        )}
        {profileData && (
          <div className="flex flex-col gap-2 text-gray-700">
            <ProfileFieldRow
              label="Name"
              fieldName="name"
              value={profileData.name}
              onUpdate={updateField}
            />
            <ProfileFieldRow
              label="Email"
              fieldName="email"
              value={profileData.email}
              onUpdate={updateField}
            />
            <ProfileFieldRow
              label="Sex"
              fieldName="sex"
              value={profileData.sex}
              onUpdate={updateField}/>
            <ProfileFieldRow
              label="Age"
              fieldName="age"
              value={profileData.age}
              onUpdate={updateField}
              isNumber={true}
            />
            <ProfileFieldRow
              label="Height (cm)"
              fieldName="height"
              value={profileData.height}
              onUpdate={updateField}
              isNumber={true}
            />
            <ProfileFieldRow
              label="Weight (kg)"
              fieldName="weight"
              value={profileData.weight}
              onUpdate={updateField}
              isNumber={true}
            />
            <ProfileFieldRow
              label="Diabetes Type"
              fieldName="diabetesType"
              value={profileData.diabetesType}
              onUpdate={updateField}
            />
            <ProfileFieldRow
              label="Target Weight (kg)"
              fieldName="targetWeight"
              value={profileData.targetWeight}
              onUpdate={updateField}
              isNumber={true}
            />
            <ProfileFieldRow
              label="Activity Level"
              fieldName="activityLevel"
              value={profileData.activityLevel}
              onUpdate={updateField}
            />
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white font-bold w-full py-2 rounded hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

// Function to display edit buttons (temp to test out Put)
function ProfileFieldRow({
  label,
  fieldName,
  value,
  onUpdate,
  isNumber,
}: {
  label: string;
  fieldName: keyof UserProfile;
  value: string | number;
  onUpdate: (fieldName: keyof UserProfile, newValue: string | number) => void;
  isNumber?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState<string | number>(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  async function handleSave() {
    let finalValue: string | number = tempValue;
    if (isNumber) {
      finalValue = parseFloat(tempValue as string) || 0;
    }

    await onUpdate(fieldName, finalValue);
    setEditing(false);
  }

  function handleCancel() {
    setTempValue(value);
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        {!editing && (
          <>
            <span className="font-bold">{label}:</span> {value}
          </>
        )}

        {editing && (
          <div className="mt-2">
            <label className="font-bold block mb-1">{label}</label>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
            />
          </div>
        )}
      </div>

      <div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="ml-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="ml-4 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
