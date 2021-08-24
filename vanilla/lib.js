const CONTENT_COUNT = 100;
const TEXT =
  "It's hard to see things when you're too close. Take a step back and look. Let your imagination be your guide. The secret to doing anything is believing that you can do it. Anything that you believe you can do strong enough, you can do. Anything. As long as you believe. I like to beat the brush. This is where you take out all your hostilities and frustrations. It's better than kicking the puppy dog around and all that so.";

export const matcher = window.matchMedia("(min-width: 540px)");

export function makeContent(root) {
  const content = [];
  for (let i = 0; i < CONTENT_COUNT; i++) {
    const p = document.createElement("p");
    p.textContent = TEXT;
    applyStyle(p, matcher.matches);

    root.appendChild(p);
    content.push(p);
  }

  return content;
}

export function applyStyle(p, matches) {
  if (matches) {
    p.style.width = "50%";
  } else {
    p.style.width = "100%";
  }
}
