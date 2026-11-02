const sections = document.querySelectorAll(".section");
const sectBtns = document.querySelectorAll(".controls");
const sectBtn = document.querySelectorAll(".control");
const allSections = document.querySelector(".main-content");
const API_URL = window.PORTFOLIO_API_URL || "http://localhost:3000/api";

// Uploaded images are stored by the API as "media/<id>"; anything else is a normal URL or a file next to the site.
function mediaUrl(value) {
	return /^media\//.test(value || "") ? `${API_URL}/${value}` : value;
}

function lookup(content, path) {
	return path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), content);
}

const listRenderers = {
	stats: (content) =>
		(content.about?.stats || []).map((stat) => `
			<div class="about-item">
				<div class="abt-text">
					<p class="large-text">${escapeHtml(stat.value)}</p>
					<p class="small-text">${escapeHtml(stat.label)}</p>
				</div>
			</div>`),
	skills: (content) =>
		(content.skills || []).map((skill) => {
			const level = Math.max(0, Math.min(100, Number(skill.level) || 0));
			return `
			<div class="progress-bar">
				<div class="prog-header">
					<p class="prog-title">${escapeHtml(skill.name)}</p>
					<p class="prog-text">${level}%</p>
				</div>
				<div class="progress" role="progressbar" aria-label="${escapeHtml(skill.name)}" aria-valuenow="${level}" aria-valuemin="0" aria-valuemax="100">
					<span style="--value: ${level}%"></span>
				</div>
			</div>`;
		}),
	experience: (content) =>
		(content.experience || []).map((item) => `
			<div class="timeline-item">
				<div class="tl-icon"><i class="fas fa-briefcase"></i></div>
				<p class="tl-duration">${escapeHtml(item.period)}</p>
				<h5>${escapeHtml(item.role)} <span>${escapeHtml(item.company)}</span></h5>
				<p>${escapeHtml(item.description)}</p>
			</div>`),
	blogs: (content) => {
		const posts = content.blogs || [];
		if (!posts.length) return [`<p class="blogs-empty">${escapeHtml(content.blog?.emptyText || "")}</p>`];
		return posts.map((post) => {
			const title = post.url ? `<a href="${escapeHtml(post.url)}" target="_blank" rel="noopener">${escapeHtml(post.title)}</a>` : escapeHtml(post.title);
			return `
			<article class="blog">
				${post.image ? `<img src="${escapeHtml(mediaUrl(post.image))}" alt="" loading="lazy" />` : ""}
				<div class="blog-text">
					<h4>${title}</h4>
					<p>${escapeHtml(post.excerpt)}</p>
				</div>
			</article>`;
		});
	},
	socials: (content) =>
		(content.contact?.socials || []).filter((social) => social.url).map((social) => `
			<a href="${escapeHtml(social.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(social.platform)}">
				<i class="fab fa-${escapeHtml(social.platform)}"></i>
			</a>`)
};

function renderContent(content) {
	if (content.site?.title) document.title = content.site.title;
	document.querySelectorAll("[data-meta]").forEach((meta) => {
		const value = lookup(content, meta.dataset.meta);
		if (typeof value === "string") meta.setAttribute("content", value);
	});
	document.querySelectorAll("[data-content]").forEach((element) => {
		const value = lookup(content, element.dataset.content);
		if (typeof value === "string") element.textContent = value;
	});
	document.querySelectorAll("[data-content-href]").forEach((element) => {
		const value = lookup(content, element.dataset.contentHref);
		if (typeof value === "string" && value) element.href = (element.dataset.hrefPrefix || "") + mediaUrl(value);
	});
	document.querySelectorAll("[data-content-src]").forEach((element) => {
		const value = lookup(content, element.dataset.contentSrc);
		if (typeof value === "string" && value) element.src = mediaUrl(value);
	});
	document.querySelectorAll("[data-title]").forEach((element) => {
		const section = content[element.dataset.title];
		if (section?.titleLead !== undefined) element.innerHTML = `${escapeHtml(section.titleLead)} <span>${escapeHtml(section.titleAccent || "")}</span>`;
	});
	document.querySelectorAll("[data-list]").forEach((element) => {
		const render = listRenderers[element.dataset.list];
		if (render) element.innerHTML = render(content).join("");
	});
}

async function loadManagedContent() {
	try {
		const response = await fetch(`${API_URL}/content`);
		if (!response.ok) return;
		const entries = await response.json();
		renderContent(Object.fromEntries(entries.map((entry) => [entry.key, entry.value])));
	} catch {
		// The static content remains available when the API is offline.
	}
}

async function loadManagedProjects() {
	try {
		const response = await fetch(`${API_URL}/projects`);
		if (!response.ok) return;
		const projects = await response.json();
		const container = document.querySelector("[data-projects]");
		if (!container) return;
		container.innerHTML = projects.map((project) => `
			<article class="portfolio-item">
				<div class="image">${project.image ? `<img src="${escapeHtml(mediaUrl(project.image))}" alt="${escapeHtml(project.title)}" loading="lazy">` : `<div class="image-placeholder"><i class="fas fa-code"></i></div>`}</div>
				<div class="hover-items"><h3>${escapeHtml(project.title)}</h3>
					${project.description ? `<p>${escapeHtml(project.description)}</p>` : ""}
					<div class="icons">
					${project.githubUrl ? `<a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener" aria-label="Source code"><i class="fab fa-github"></i></a>` : ""}
					${project.liveUrl ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener" aria-label="Live site"><i class="fas fa-external-link-alt"></i></a>` : ""}
				</div></div>
			</article>`).join("");
	} catch {
		// The bundled portfolio remains available when the API is offline.
	}
}

function escapeHtml(value) {
	return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
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

	// In-page buttons (e.g. "Contact me") reuse the matching nav control so its highlight stays in sync
	document.querySelectorAll("[data-goto]").forEach((button) => {
		button.addEventListener("click", () => {
			document.querySelector(`.control[data-id="${button.dataset.goto}"]`)?.click();
		});
	});
}

// call the function
pageTransitions();
loadManagedContent();
loadManagedProjects();
