const sections = document.querySelectorAll(".section");
const sectBtns = document.querySelectorAll(".controls");
const sectBtn = document.querySelectorAll(".control");
const allSections = document.querySelector(".main-content");

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
}

// call the function
pageTransitions();
