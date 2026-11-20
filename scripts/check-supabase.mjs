// Checks that .env.local is filled in and that the Supabase project answers.
// Run with:  npm run check:supabase   (in PowerShell: npm.cmd run check:supabase)
//
// It never prints your key. It only reports whether things work.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (!url || url.startsWith("your-")) {
  fail("NEXT_PUBLIC_SUPABASE_URL is not set in .env.local.");
}
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
  fail(
    "NEXT_PUBLIC_SUPABASE_URL doesn't look like https://<project-ref>.supabase.co (check for extra paths or spaces).",
  );
}
if (!key || key.startsWith("your-")) {
  fail("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set in .env.local.");
}
if (key.startsWith("sb_secret_")) {
  fail(
    "That is the SECRET key. Replace it with the publishable key (sb_publishable_...) and keep the secret key private.",
  );
}
if (!key.startsWith("sb_publishable_")) {
  console.warn(
    "! The key doesn't start with sb_publishable_. If it's an older 'anon' key it may still work, but the publishable key is recommended.",
  );
}

console.log("✓ .env.local has both values");

try {
  const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
    headers: { apikey: key },
  });
  if (response.ok) {
    console.log("✓ Supabase project is reachable and accepted the key");
  } else if (response.status === 401 || response.status === 403) {
    fail(
      `Supabase rejected the key (HTTP ${response.status}). Re-copy the publishable key.`,
    );
  } else {
    fail(`Supabase answered with HTTP ${response.status}.`);
  }
} catch (error) {
  fail(
    `Couldn't reach Supabase: ${error.message}. Check the URL and your internet connection. New projects can take a minute or two to start.`,
  );
}
