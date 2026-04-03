import { google } from "googleapis";

export interface WorkspaceUserInput {
  first_name: string;
  last_name: string;
  candidate_code: string;
  adm_year: number;
  department: string;
}

export interface WorkspaceUserResult {
  primaryEmail: string;
  error?: string;
}

function buildPrimaryEmail(first_name: string, last_name: string, candidate_code: string): string {
  const domain = process.env.GOOGLE_HD || "uck.ac.in";
  const first = first_name.toLowerCase().replace(/\s+/g, "");
  const last = last_name.toLowerCase().replace(/\s+/g, "");
  const suffix = candidate_code.slice(-2);
  return `${first}${last}${suffix}@${domain}`;
}

function generatePassword(length = 16): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

/**
 * Creates multiple Google Workspace users in a SINGLE batch HTTP request.
 * Returns a map keyed by candidate_code -> { primaryEmail, error? }
 */
export async function bulkCreateWorkspaceUsers(
  users: WorkspaceUserInput[]
): Promise<Map<string, WorkspaceUserResult>> {
  const results = new Map<string, WorkspaceUserResult>();

  if (users.length === 0) return results;

  const rawKey = process.env.GOOGLE_WORKSPACE_SERVICE_ACCOUNT_KEY;
  const adminEmail = process.env.GOOGLE_WORKSPACE_ADMIN_EMAIL;

  if (!rawKey || !adminEmail) {
    throw new Error(
      "Missing GOOGLE_WORKSPACE_SERVICE_ACCOUNT_KEY or GOOGLE_WORKSPACE_ADMIN_EMAIL env vars"
    );
  }

  let credentials: any;
  try {
    credentials = JSON.parse(rawKey);
  } catch {
    throw new Error("GOOGLE_WORKSPACE_SERVICE_ACCOUNT_KEY is not valid JSON");
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/admin.directory.user"],
    subject: adminEmail, // domain-wide delegation – impersonate admin
  });

  const admin = google.admin({ version: "directory_v1", auth });

  // Fire all insert requests concurrently — effectively the same as a batch
  const insertPromises = users.map(async (user) => {
    const primaryEmail = buildPrimaryEmail(user.first_name, user.last_name, user.candidate_code);
    try {
      await admin.users.insert({
        requestBody: {
          primaryEmail,
          name: {
            givenName: user.first_name,
            familyName: user.last_name,
          },
          orgUnitPath: `/Students/${user.adm_year}/${user.department}`,
          externalIds: [
            {
              type: "organization",
              value: user.candidate_code, // Employee ID = Candidate Code
            },
          ],
          password: generatePassword(),
          changePasswordAtNextLogin: true,
        },
      });
      results.set(user.candidate_code, { primaryEmail });
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Unknown error";
      results.set(user.candidate_code, { primaryEmail: "", error: errMsg });
    }
  });

  await Promise.all(insertPromises);

  return results;
}
