const USERS = "users";
const JOBS = "jobs";
const APPS = "applications";
const CURRENT = "currentUser";
// ---------- AUTH ----------
function signup() {
let users = JSON.parse(localStorage.getItem(USERS)) || [];
const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
const role = document.querySelector('input[name="role"]:checked').value;
if (users.find(u => u.email === email)) {
alert("User exists");
return;
}
users.push({ name, email, password, role });
localStorage.setItem(USERS, JSON.stringify(users));
alert("Signup successful!");
}
function login() {
let users = JSON.parse(localStorage.getItem(USERS)) || [];
const email = document.getElementById("loginEmail").value;
const password = document.getElementById("loginPassword").value;
const user = users.find(u => u.email === email && u.password === password);
if (!user) {
alert("Invalid login");
return;
}
localStorage.setItem(CURRENT, JSON.stringify(user));
loadDashboard();
}
function logout() {
localStorage.removeItem(CURRENT);
location.reload();
}
// ---------- DASHBOARD ----------
 
 86
function loadDashboard() {
const user = JSON.parse(localStorage.getItem(CURRENT));
if (!user) return;
document.getElementById("loginBox").classList.add("hidden");
document.getElementById("signupBox").classList.add("hidden");
if (user.role === "user") {
document.getElementById("userDashboard").classList.remove("hidden");
loadJobs();
} else {
document.getElementById("companyDashboard").classList.remove("hidden");
loadCompanyJobs();
}
}
window.onload = loadDashboard;
// ---------- JOBS ----------
function postJob() {
let jobs = JSON.parse(localStorage.getItem(JOBS)) || [];
const user = JSON.parse(localStorage.getItem(CURRENT));
const job = {
id: Date.now(),
title: jobTitle.value,
location: jobLocation.value,
salary: jobSalary.value,
description: jobDesc.value,
ownerEmail: user.email
};
if (jobs.find(j => j.title === job.title && j.ownerEmail === user.email)) {
alert("Duplicate job");
return;
}
jobs.push(job);
localStorage.setItem(JOBS, JSON.stringify(jobs));
alert("Job posted!");
loadCompanyJobs();
}
// ---------- COMPANY JOBS ----------
function loadCompanyJobs() {
const user = JSON.parse(localStorage.getItem(CURRENT));
let jobs = JSON.parse(localStorage.getItem(JOBS)) || [];
 
 87
const container = document.getElementById("companyJobs");
container.innerHTML = "";
jobs.filter(j => j.ownerEmail === user.email).forEach(job => {
container.innerHTML += `
<div class="job-card">
<h3>${job.title}</h3>
<p>${job.location}</p>
<button onclick="deleteJob(${job.id})">Delete</button>
<button onclick="viewApplicants(${job.id})">Applicants</button>
</div>
`;
});
}
// ---------- DELETE JOB ----------
function deleteJob(id) {
let jobs = JSON.parse(localStorage.getItem(JOBS)) || [];
jobs = jobs.filter(j => j.id !== id);
localStorage.setItem(JOBS, JSON.stringify(jobs));
loadCompanyJobs();
}
// ---------- LOAD JOBS FOR USER ----------
function loadJobs() {
let jobs = JSON.parse(localStorage.getItem(JOBS)) || [];
const search = document.getElementById("search").value.toLowerCase();
const container = document.getElementById("jobs");
container.innerHTML = "";
jobs
.filter(j => j.title.toLowerCase().includes(search))
.forEach(job => {
container.innerHTML += `
<div class="job-card">
<h3>${job.title}</h3>
<p>${job.location}</p>
<button onclick="applyJob(${job.id}, '${job.ownerEmail}')">Apply</button>
</div>
`;
});
}
// ---------- APPLY ----------
function applyJob(jobId, companyEmail) {
const user = JSON.parse(localStorage.getItem(CURRENT));
let apps = JSON.parse(localStorage.getItem(APPS)) || [];
 
 88
if (apps.find(a => a.jobId === jobId && a.userEmail === user.email)) {
alert("Already applied!");
return;
}
apps.push({
jobId,
userEmail: user.email,
companyEmail,
date: new Date().toLocaleDateString()
});
localStorage.setItem(APPS, JSON.stringify(apps));
alert("Applied!");
}
// ---------- VIEW APPLICANTS ----------
function viewApplicants(jobId) {
let apps = JSON.parse(localStorage.getItem(APPS)) || [];
const filtered = apps.filter(a => a.jobId === jobId);
alert(JSON.stringify(filtered, null, 2));
}