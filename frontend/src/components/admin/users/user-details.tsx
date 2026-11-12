
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  Gamepad2,
  Trophy,
  Wallet,
  TrendingUp,
  Pencil,
  Ban,
  CheckCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { api, type AdminUser } from "@/lib/api";

const mockStats = [
  { label: "Games Played", value: "24", icon: Gamepad2 },
  { label: "Tournaments", value: "8", icon: Trophy },
  { label: "Wallet Balance", value: "₦45,000", icon: Wallet },
  { label: "Total Deposits", value: "₦120,000", icon: TrendingUp },
];

const mockActivities = [
  {
    title: "Logged into account",
    description: "User signed in successfully",
    date: "Today, 10:30 AM",
  },
  {
    title: "Wallet deposit",
    description: "₦10,000 deposited into wallet",
    date: "Yesterday, 2:15 PM",
  },
  {
    title: "Joined a tournament",
    description: "Participated in a gaming tournament",
    date: "2 days ago",
  },
];

function formatDate(date?: string | null) {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DetailItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
          <Icon size={17} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium">{value || "Not available"}</p>
      </div>
    </div>
  );
}

export default function UserDetails() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const loadUser = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const data = await api.adminGetUser(userId);

      setUser(data);
      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone_number: data.phone_number || "",
      });
    } catch (error) {
      console.error("Failed to load user:", error);
      toast.error("Failed to load user details.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleUpdate = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const updatedUser = await api.adminUpdateUser(user.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number || "",
      });

      setUser(updatedUser);
      setEditing(false);
      toast.success("User details updated successfully.");
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Could not update user details.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!user) return;

    const action = user.is_active ? "suspend" : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const updatedUser = await api.adminUpdateUser(user.id, {
        is_active: !user.is_active,
      });

      setUser(updatedUser);
      toast.success(
        updatedUser.is_active
          ? "User account reactivated."
          : "User account suspended."
      );
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error(`Failed to ${action} user.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${user.username}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await api.adminDeleteUser(user.id);

      toast.success("User deleted successfully.");
      router.push("/admin/users");
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <User size={40} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold">User not found</h2>
        <p className="text-sm text-muted-foreground">
          This user may have been deleted or does not exist.
        </p>
        <button
          onClick={() => router.push("/admin/users")}
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to users
        </button>
      </div>
    );
  }

  const fullName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.username;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/admin/users")}
            className="mb-3 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to users
          </button>

          <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage this user's account.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            <Pencil size={16} />
            {editing ? "Cancel Edit" : "Edit User"}
          </button>

          <button
            onClick={handleStatusToggle}
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
              user.is_active
                ? "border border-red-500/30 text-red-500 hover:bg-red-500/10"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {user.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
            {user.is_active ? "Suspend User" : "Reactivate User"}
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {(user.first_name?.[0] || user.username?.[0] || "U").toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">{fullName}</h2>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                user.is_active
                  ? "bg-green-500/10 text-green-600"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {user.is_active ? "Active" : "Suspended"}
            </span>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium capitalize text-primary">
              {user.role || "User"}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                user.is_email_verified
                  ? "bg-green-500/10 text-green-600"
                  : "bg-yellow-500/10 text-yellow-600"
              }`}
            >
              {user.is_email_verified ? "Email Verified" : "Email Unverified"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats - Mock data for now */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mock data
              </p>
            </div>
          );
        })}
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-5 font-semibold">Edit User Information</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                First Name
              </label>
              <input
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Last Name
              </label>
              <input
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>
              <input
                value={form.phone_number}
                onChange={(e) =>
                  setForm({ ...form, phone_number: e.target.value })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Account Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-6 font-semibold">Personal Information</h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <DetailItem label="First Name" value={user.first_name} icon={User} />
            <DetailItem label="Last Name" value={user.last_name} icon={User} />
            <DetailItem label="Email Address" value={user.email} icon={Mail} />
            <DetailItem
              label="Phone Number"
              value={user.phone_number || "Not provided"}
              icon={Phone}
            />
            <DetailItem label="Username" value={user.username} icon={User} />
            <DetailItem label="Role" value={user.role || "User"} icon={Shield} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-6 font-semibold">Account Information</h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <DetailItem
              label="Date Joined"
              value={formatDate(user.date_joined)}
              icon={Calendar}
            />
            <DetailItem
              label="Last Login"
              value={formatDate(user.last_login)}
              icon={Clock}
            />
            <DetailItem
              label="Account Status"
              value={user.is_active ? "Active" : "Suspended"}
              icon={CheckCircle}
            />
            <DetailItem
              label="Email Verification"
              value={user.is_email_verified ? "Verified" : "Not verified"}
              icon={Mail}
            />
            <DetailItem
              label="Staff Account"
              value={user.is_staff ? "Yes" : "No"}
              icon={Shield}
            />
            <DetailItem
              label="Superuser"
              value={user.is_superuser ? "Yes" : "No"}
              icon={Shield}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity - Mock data */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Recent Activity</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Sample activity entries — not yet connected to the API.
            </p>
          </div>
          <Clock size={20} className="text-muted-foreground" />
        </div>

        <div className="space-y-6">
          {mockActivities.map((activity, index) => (
            <div key={index} className="flex gap-4">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {activity.date}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
