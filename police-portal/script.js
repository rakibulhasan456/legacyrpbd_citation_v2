const supabase = window.supabase.createClient(
  "https://ddxkkjxzeurqravxlkut.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeGtranh6ZXVycXJhdnhsa3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NjI4NzksImV4cCI6MjA4NzEzODg3OX0.JpBc0gf3Fbl5jLtAYhwMpsCMlvkVnTz-SN2WYuD-TMc"
);

let currentOfficer = "";
let currentRole = "";

// AUTO LOGIN
window.onload = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    loadOfficer(session.user.email);
  }
};

// LOGIN
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

  loadOfficer(email);
}

// REGISTER
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

// LOAD OFFICER
async function loadOfficer(email) {
  const license = email.replace("@pd.local", "");

  const { data } = await supabase
    .from("officers")
    .select("*")
    .eq("license", license)
    .single();

  if (!data) {
    await supabase.auth.signOut();
    alert("Unauthorized.");
    return;
  }

  currentOfficer = data.name;
  currentRole = data.role;

  document.getElementById("authBox").style.display = "none";
  document.getElementById("registerBox").style.display = "none";

  if (currentRole === "admin") {
    document.getElementById("dashboard").style.display = "block";
  } else {
    document.getElementById("citationForm").style.display = "block";
  }

  document.getElementById("officerName").value = currentOfficer;
}

// ADD OFFICER (Admin)
async function addOfficer() {
  const license = document.getElementById("newLicense").value;
  const name = document.getElementById("newName").value;
  const role = document.getElementById("newRole").value;

  await supabase.from("officers").insert([{ license, name, role }]);
  alert("Officer Added");
}

// SUBMIT CITATION
document.getElementById("citationForm")
.addEventListener("submit", async function(e) {
  e.preventDefault();

  const data = {
    title: document.getElementById("title").value,
    suspect_name: document.getElementById("suspectName").value,
    cid: document.getElementById("cid").value,
    contact: document.getElementById("contact").value,
    report: document.getElementById("report").value,
    officer: currentOfficer
  };

  await supabase.from("citations").insert([data]);

  alert("Citation Submitted");
  this.reset();
  document.getElementById("officerName").value = currentOfficer;
});

// LOGOUT
async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

function showRegister() {
  document.getElementById("authBox").style.display = "none";
  document.getElementById("registerBox").style.display = "block";
}

function showLogin() {
  document.getElementById("authBox").style.display = "block";
  document.getElementById("registerBox").style.display = "none";
}