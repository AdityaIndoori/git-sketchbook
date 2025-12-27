# The Git Sketchbook 📓

An interactive visual guide to Git concepts — because version control shouldn't feel like magic.

## 🎯 What is this?

The Git Sketchbook is a single-page web application that teaches Git fundamentals through interactive visualizations. Instead of memorizing commands, you'll understand *why* Git works the way it does.

## 🚀 Live Demo

Open `index.html` in your browser to start exploring!

## 📚 Concepts Covered

### 1. The Commit
- Commits are **snapshots**, not diffs
- Git stores pointers to unchanged files for efficiency
- Every commit is immutable — change anything and you get a new hash

### 2. Branches
- Branches are just **lightweight pointers** to commits
- Creating a branch is instant (it's just a tiny file storing a hash!)
- Think of them as movable sticky notes

### 3. The HEAD Pointer
- HEAD is your "You Are Here" marker
- The chain: `HEAD → branch → commit`
- Detached HEAD mode and its risks

### 4. The Four Areas of Git
- **Working Directory** (The Sandbox)
- **Staging Area** (The Preparation Zone)
- **Local Repository** (The Database)
- **Remote Repository** (The Cloud)

### 5. Modifying Commit History
- **Reset** — Moves branch pointer backward (various safety levels)
- **Revert** — Creates inverse commit safely
- **Rebase** — Replays commits onto a new base (don't rebase public history!)

### 6. Git Reflog
- Your safety net for "lost" commits
- Git tracks every HEAD movement for ~90 days
- Recovery is often just a `git checkout HEAD@{n}` away

## 🛠️ Tech Stack

- Pure HTML, CSS, and JavaScript
- No frameworks or dependencies
- Hand-drawn sketchbook aesthetic using Google Fonts

## 📖 Usage

Simply clone and open:

```bash
git clone https://github.com/AdityaIndoori/git-sketchbook.git
cd git-sketchbook
# Open index.html in your browser
```

Or just download and double-click `index.html`!

## ✨ Features

- **Interactive visualizations** — Click to create commits, move branches, simulate reset/revert/rebase
- **Real World + Code tabs** — See both the concept and the actual Git commands
- **Mobile responsive** — Learn on any device
- **Sketchbook design** — Feels like your personal notes

## 📝 License

Feel free to use, modify, and share!

---

Made with ☕ by [Aditya Indoori](https://github.com/AdityaIndoori)
