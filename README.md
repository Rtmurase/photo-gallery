# SAUCY.LIFE Photo Gallery

Visit the site: [https://rtmurase.github.io/photo-gallery](https://rtmurase.github.io/photo-gallery)

## License

**All photographs remain under exclusive copyright and are not available for use without permission.**

All code in this repository is available under the MIT License.

### Creating an Album

1. Run the album creation script:

```bash
node scripts/create_album.js
```

2. Follow the prompts to enter album information
3. Add your photos to the created album directory (in the `photos/[album-slug]` folder)
4. Edit the album's markdown file to specify a cover image by filling in the `cover_image` field

### Running Locally

```bash
bundle exec jekyll serve --config _config.yml,_config_development.yml
```

Visit `http://localhost:4000` in your browser.

### Deploying to GitHub Pages

1. Push your repository to GitHub
2. In your GitHub repository settings, enable GitHub Pages from your main branch