# Photo Gallery Website

A clean, simple Jekyll-based photo gallery website designed to be hosted on GitHub Pages.

## Features

- Responsive design that works great on mobile and desktop
- Album-based organization for your photos
- Lightbox for viewing photos with navigation controls
- Easy to create new albums with a simple script
- Free hosting on GitHub Pages

## Getting Started

### Prerequisites

- Ruby (for Jekyll)
- Node.js (for the album creation script)

### Installation

1. Clone this repository

```bash
git clone https://github.com/yourusername/photo-gallery.git
cd photo-gallery
```

2. Install dependencies

```bash
# Install Ruby dependencies
bundle install

# Install Node.js dependencies for the scripts
cd scripts
npm install
cd ..
```

### Creating an Album

1. Run the album creation script:

```bash
node scripts/create_album.js
```

2. Follow the prompts to enter:
   - Album title
   - Album description
   - Album date (YYYY-MM-DD)

3. Add your photos to the created album directory (in the `photos/[album-slug]` folder)

### Running Locally

To see your site locally:

```bash
bundle exec jekyll serve
```

Visit `http://localhost:4000` in your browser.

### Deploying to GitHub Pages

1. Push your repository to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

2. In your GitHub repository settings, enable GitHub Pages:
   - Go to "Settings" → "Pages"
   - Select the branch (usually `main`) as the source
   - Save

Your site will be available at `https://yourusername.github.io/photo-gallery/`

## Project Structure

```
photo-gallery/
├── _albums/                  # Collection for albums (Jekyll collection)
├── _config.yml               # Jekyll configuration
├── _includes/                # Reusable components
│   ├── album-card.html       # Component for album display
│   ├── footer.html           # Footer component
│   └── header.html           # Header component
├── _layouts/                 # Page templates
│   ├── album.html            # Layout for album pages
│   ├── default.html          # Base layout
│   └── home.html             # Home page layout
├── assets/                   # Static assets
│   ├── css/                  # CSS files
│   │   └── main.scss         # Main SCSS file
│   ├── images/               # Images for the site itself
│   └── js/                   # JavaScript files
│       └── gallery.js        # Gallery functionality
├── photos/                   # Where albums with photos will live
│   ├── album-name/           # Example album folder
│   │   ├── metadata.json     # Album metadata
│   │   ├── photo1.jpg
│   │   └── ...
│   └── ...
├── scripts/                  # Scripts for managing the site
│   └── create_album.js       # Script to create new albums
├── .gitignore                # Git ignore file
├── Gemfile                   # Ruby dependencies
├── Gemfile.lock              # Ruby dependencies lock file
├── index.md                  # Home page
└── README.md                 # Project documentation
```

## Customization

You can customize the website by:

1. Editing `_config.yml` to change the site title, description, etc.
2. Modifying the CSS in `assets/css/main.scss`
3. Updating the layouts and includes to change the structure of pages

## License

This project is available for free use.
