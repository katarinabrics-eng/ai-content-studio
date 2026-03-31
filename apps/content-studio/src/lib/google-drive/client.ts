import { google } from "googleapis";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

function getAuth() {
  // Preferuj JSON blob GOOGLE_SERVICE_ACCOUNT, fallback na oddělené proměnné
  const jsonBlob = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (jsonBlob) {
    const sa = JSON.parse(jsonBlob) as {
      client_email: string;
      private_key: string;
    };
    return new google.auth.JWT({
      email: sa.client_email,
      key: sa.private_key,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !rawKey) {
    throw new Error(
      "Chybí Google Service Account env variables: " +
        "GOOGLE_SERVICE_ACCOUNT nebo GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
    );
  }

  return new google.auth.JWT({
    email,
    key: rawKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

function getDriveClient() {
  return google.drive({ version: "v3", auth: getAuth() });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink: string | null;
  modifiedTime: string;
  subfolder: string | null;
}

// ---------------------------------------------------------------------------
// 1. listFolderContents — rekurzivní průchod složkou
// ---------------------------------------------------------------------------

export async function listFolderContents(folderId: string): Promise<DriveFile[]> {
  const drive = getDriveClient();
  const results: DriveFile[] = [];

  async function crawl(currentFolderId: string, subfolderName: string | null) {
    let pageToken: string | undefined;

    do {
      const res = await drive.files.list({
        q: `'${currentFolderId}' in parents and trashed = false`,
        fields:
          "nextPageToken, files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, modifiedTime)",
        pageSize: 200,
        pageToken,
      });

      const files = res.data.files ?? [];

      for (const file of files) {
        // přeskoč zkratky
        if (file.mimeType === "application/vnd.google-apps.shortcut") continue;

        if (file.mimeType === "application/vnd.google-apps.folder") {
          // rekurzivně projdi podsložku (název první úrovně = subfolder label)
          await crawl(file.id!, subfolderName ?? file.name!);
        } else {
          results.push({
            id: file.id ?? "",
            name: file.name ?? "",
            mimeType: file.mimeType ?? "",
            webViewLink: file.webViewLink ?? "",
            webContentLink: file.webContentLink ?? "",
            thumbnailLink: file.thumbnailLink ?? null,
            modifiedTime: file.modifiedTime ?? "",
            subfolder: subfolderName,
          });
        }
      }

      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);
  }

  await crawl(folderId, null);
  return results;
}

// ---------------------------------------------------------------------------
// 2. downloadFileAsText — stáhne .txt a vrátí UTF-8 string
// ---------------------------------------------------------------------------

export async function downloadFileAsText(fileId: string): Promise<string> {
  const drive = getDriveClient();

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "text" }
  );

  return res.data as string;
}

// ---------------------------------------------------------------------------
// 3. downloadFileAsBuffer — stáhne soubor jako Buffer (PDF, obrázky…)
// ---------------------------------------------------------------------------

export async function downloadFileAsBuffer(fileId: string): Promise<Buffer> {
  const drive = getDriveClient();

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(res.data as ArrayBuffer);
}
