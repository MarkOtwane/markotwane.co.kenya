const sections = document.querySelectorAll(".section");
const sectBtns = document.querySelectorAll(".controls");
const sectBtn = document.querySelectorAll(".control");
const allSections = document.querySelector(".main-content");
const API_URL = window.PORTFOLIO_API_URL || "http://localhost:3000/api";

async function loadManagedContent() {
	try {
		const response = await fetch(`${API_URL}/content`);
		if (!response.ok) return;
		const content = await response.json();
		content.forEach((entry) => Object.entries(entry.value || {}).forEach(([field, value]) => {
			document.querySelectorAll(`[data-content="${entry.key}.${field}"]`).forEach((element) => {
				if (typeof value === "string") element.textContent = value;
			});
		}));
	} catch {
		// The static content remains available when the API is offline.
	}
}

async function loadManagedProjects() {
	try {
		const response = await fetch(`${API_URL}/projects`);
		if (!response.ok) return;
		const projects = await response.json();
		if (!projects.length) return;
		const container = document.querySelector("[data-projects]");
		if (!container) return;
		container.innerHTML = projects.map((project) => `
			<article class="portfolio-item">
				<div class="image"><img src="${escapeHtml(project.image || "reduced_image_65_percent.png")}" alt="${escapeHtml(project.title)}" loading="lazy"></div>
				<div class="hover-items"><h3>${escapeHtml(project.title)}</h3><div class="icons">
					${project.githubUrl ? `<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener"><i class="fab fa-github"></i></a>` : ""}
					${project.liveUrl ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i></a>` : ""}
				</div></div>
			</article>`).join("");
	} catch {
		// The bundled portfolio remains available when the API is offline.
	}
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

async function submitInquiry(event) {
	event.preventDefault();
	const form = event.currentTarget;
	const status = document.querySelector("#contact-status");
	const button = form.querySelector("button");
	button.disabled = true;
	status.textContent = "Sending...";
	try {
		const response = await fetch(`${API_URL}/inquiries`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(Object.fromEntries(new FormData(form)))
		});
		if (!response.ok) {
			const body = await response.json().catch(() => ({}));
			throw new Error(body.message || "Unable to send your message.");
		}
		form.reset();
		status.textContent = "Thanks. Your message has been sent.";
	} catch (error) {
		status.textContent = error.message;
	} finally {
		button.disabled = false;
	}
}

function pageTransitions() {
	// Button click active class
	for (let i = 0; i < sectBtn.length; i++) {
		sectBtn[i].addEventListener("click", function () {
			let currentBtn = document.querySelectorAll(".active-btn");
			currentBtn[0].className = currentBtn[0].className.replace("active-btn", "");
			this.className += " active-btn";
		});
	}

	// sections Active class
	allSections.addEventListener("click", (e) => {
		const id = e.target.dataset.id;
		if (id) {
			// remove selected from the other button
			sectBtns.forEach((btn) => {
				btn.classList.remove("active");
			});
			e.target.classList.add("active");

			// hide other sections
			sections.forEach((section) => {
				section.classList.remove("active");
			});

			const element = document.getElementById(id);
			element.classList.add("active");
		}
	});

	// Theme toggle with persistence and icon update
	const themeBtn = document.querySelector(".theme-btn");
	const themeIcon = themeBtn && themeBtn.querySelector("i");

	function applyTheme(theme) {
		const body = document.body;
		if (theme === "light") {
			body.classList.add("light-mode");
			if (themeIcon) {
				themeIcon.classList.remove("fa-moon");
				themeIcon.classList.add("fa-sun");
			}
		} else {
			body.classList.remove("light-mode");
			if (themeIcon) {
				themeIcon.classList.remove("fa-sun");
				themeIcon.classList.add("fa-moon");
			}
		}
	}

	// Initialize theme from localStorage; default to dark when no saved preference
	(function initTheme() {
		const saved = localStorage.getItem("theme");
		if (saved) {
			applyTheme(saved);
		} else {
			// Default to dark mode when there's no saved preference
			applyTheme("dark");
		}
	})();

	if (themeBtn) {
		themeBtn.addEventListener("click", () => {
			const isLight = document.body.classList.toggle("light-mode");
			const theme = isLight ? "light" : "dark";
			localStorage.setItem("theme", theme);
			applyTheme(theme);
		});
		// keyboard support (Enter or Space)
		themeBtn.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
				e.preventDefault();
				themeBtn.click();
			}
		});
	}

	document.querySelector("#contact-form")?.addEventListener("submit", submitInquiry);
}

// call the function
pageTransitions();
loadManagedContent();
loadManagedProjects();
