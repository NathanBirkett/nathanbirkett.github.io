const projects = document.getElementById("projects");
const about_me = document.getElementById("about_me");
const contact = document.getElementById("contact");
const resume = document.getElementById("resume");

const selectorArray = [projects, about_me, contact, resume];
var active = projects;
var activeID = 0;

function forward() {
    active.style.width = '12vw';
    active.style.background = 'radial-gradient(#fff calc(1.5vw - 1px), #888 1.5vw)';
    active.children[0].children[0].style.color = 'rgba(255, 255, 255, 0)';
    activeID = (activeID + 1)%selectorArray.length;
    active = selectorArray[activeID];
    active.style.textIndent = 0;
    active.style.background = 'radial-gradient(#888 calc(1.5vw - 1px), #888 1.5vw)';
    active.style.width = '30vw';
    active.children[0].children[0].style.color = 'rgba(255, 255, 255, 1)';
}

function back() {
    active.style.width = '12vw';
    active.style.background = 'radial-gradient(#fff calc(1.5vw - 1px), #888 1.5vw)';
    active.children[0].children[0].style.color = 'rgba(255, 255, 255, 0)';
    activeID = ((activeID - 1)%selectorArray.length + selectorArray.length) % selectorArray.length;
    active = selectorArray[activeID];
    active.style.textIndent = 0;
    active.style.background = 'radial-gradient(#888 calc(1.5vw - 1px), #888 1.5vw)';
    active.style.width = '30vw';
    active.children[0].children[0].style.color = 'rgba(255, 255, 255, 1)';
}

const next = document.getElementById("forward");
next.addEventListener("click", forward);

const prev = document.getElementById("back");
prev.addEventListener("click", back);

document.addEventListener('keydown', function(event) {
    console.log(event);
    if (event.key == 'ArrowRight') {
        forward();
    }
});

document.addEventListener('keydown', function(event) {
    console.log(event);
    if (event.key == 'ArrowLeft') {
        back();
    }
});