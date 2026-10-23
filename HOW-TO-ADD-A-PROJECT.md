# How to add a new project

Everything below uses a project called **"My New Project"** with the slug **`my-new-project`**.
A slug is the short lowercase name used in file names: letters, numbers and hyphens only.

## 1. Add the pictures

* **Card / page picture:** `assets/work/my-new-project.jpg` (a Playground project goes in `assets/playground/`).
  Landscape 3:2, about 1600 x 1067 px, under about 400 KB.
* **Hover clip (optional):** `assets/clips/my-new-project.mp4` - 3 to 6 seconds, no sound, under about 600 KB.
  Horizontal or vertical both work.

## 2. Make the project page

1. Copy `tools/project-template.html` into the `work/` folder (or `playground/`).
2. Rename it to `my-new-project.html`.
3. Open it and replace everything in capitals: the title, the slug in the image path, the four sections
   (problem, what I did, what I used, result) and the button link.
   For a YouTube film, use the two commented-out blocks inside the file (remove the comment markers).

## 3. Add the card

Open `work.html` (or `playground.html`) and paste this block **inside the `<div class="bento ...">`**, at the position
you want the project to appear. Change the capitals.

```html
<a class="card" href="work/PROJECT-SLUG.html">
  <div class="card-media">
    <img src="assets/work/PROJECT-SLUG.jpg" alt="Describe the picture">
  </div>
  <div class="card-body">
    <h3>PROJECT TITLE</h3>
    <p>One line about the project.</p>
  </div>
</a>
```

The layout re-arranges itself: **no layout code needs changing.** It repeats every 6 cards on Work and every 3 on
Playground. Only the very last row can look a little gappy if the count isn't a full set.

To also show the project in the sliding gallery on the Home page, paste the same block into the
`<div class="rail" id="rail">` in `index.html`. (Use only the originals, the copies are created automatically.)

## 4. Add one line to the project list

Open `js/main.js`. At the very top is the `PROJECTS` list. Add a line in the same order as the cards:

```js
  { slug: 'my-new-project', title: 'My New Project', folder: 'work' },
```

This is what makes the Previous / Next links at the bottom of project pages work.

## 5. Optional: a hover clip

If you added `assets/clips/my-new-project.mp4`, change the card opening tag to:

```html
<a class="card" href="work/my-new-project.html" data-clip="assets/clips/my-new-project.mp4">
```

and add this line right after the `<img ...>` inside `card-media`, plus a `style` on the `card-media` div so vertical clips get a soft backdrop:

```html
<div class="card-media" style="--bg:url('assets/work/my-new-project.jpg')">
  <img src="assets/work/my-new-project.jpg" alt="...">
  <video class="card-clip" muted loop playsinline preload="none" data-src="assets/clips/my-new-project.mp4" aria-hidden="true" tabindex="-1"></video>
</div>
```

## 6. Check it

Open the site with VS Code's Live Server and look at: the Work page, the new project page, the Previous / Next links,
and your phone view. Then push to GitHub and Netlify redeploys on its own.
