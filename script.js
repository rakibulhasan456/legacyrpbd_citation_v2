// ---------------- SUPABASE INIT ----------------
const SUPABASE_URL = "https://ddxkkjxzeurqravxlkut.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeGtranh6ZXVycXJhdnhsa3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NjI4NzksImV4cCI6MjA4NzEzODg3OX0.JpBc0gf3Fbl5jLtAYhwMpsCMlvkVnTz-SN2WYuD-TMc";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let currentOfficer = "";

// ---------------- AUTO LOGIN ----------------
window.onload = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    await loadOfficer(session.user.email);
  }
};

// ---------------- LOGIN ----------------
async function login() {
  const license = document.getElementById("licenseId").value.trim();
  const password = document.getElementById("password").value.trim();

  const email = `${license}@pd.local`;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    document.getElementById("loginError").innerText = error.message;
    return;
  }

  await loadOfficer(email);
}

// ---------------- REGISTER ----------------
async function register() {
  const license = document.getElementById("regLicenseId").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const email = `${license}@pd.local`;

  const { data: officer } = await supabase
    .from("officers")
    .select("*")
    .eq("license", license)
    .single();

  if (!officer) {
    document.getElementById("registerError").innerText =
      "License not authorized.";
    return;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    document.getElementById("registerError").innerText = error.message;
    return;
  }

  alert("Registration successful.");
  showLogin();
}

// ---------------- LOAD OFFICER ----------------
async function loadOfficer(email) {
  const license = email.replace("@pd.local", "");

  const { data } = await supabase
    .from("officers")
    .select("*")
    .eq("license", license)
    .single();

  if (!data) {
    alert("Unauthorized officer.");
    await supabase.auth.signOut();
    return;
  }

  currentOfficer = data.name;

  document.getElementById("authBox").style.display = "none";
  document.getElementById("registerBox").style.display = "none";
  document.getElementById("citationForm").style.display = "block";
  document.getElementById("officerName").value = currentOfficer;
}

// ---------------- LOGOUT ----------------
async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

// ---------------- ADD OFFICER ----------------
async function addOfficer() {
  const license = document.getElementById("newLicense").value;
  const name = document.getElementById("newName").value;

  await supabase.from("officers").insert([{ license, name }]);

  alert("Officer added.");
}

// ---------------- UI ----------------
function showRegister() {
  document.getElementById("authBox").style.display = "none";
  document.getElementById("registerBox").style.display = "block";
}

function showLogin() {
  document.getElementById("authBox").style.display = "block";
  document.getElementById("registerBox").style.display = "none";
}