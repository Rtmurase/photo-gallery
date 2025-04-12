#!/usr/bin/env node

/**
 * Script to create a new album for the Jekyll photo gallery
 * 
 * Usage:
 * node scripts/create_album.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask a question and return the answer
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to convert string to URL-friendly slug
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();                  // Trim leading/trailing hyphens
}

// Function to create a directory if it doesn't exist
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Main function
async function createAlbum() {
  try {
    // Determine the root directory (one level up from the scripts folder)
    const rootDir = path.resolve(__dirname, '..');
    
    // Get album information from the user
    const title = await askQuestion('Album title: ');
    const description = await askQuestion('Album description: ');
    
    // Get date with default to today
    let dateInput = await askQuestion('Album date (YYYY-MM-DD), leave blank for today: ');
    const date = dateInput.trim() || new Date().toISOString().split('T')[0];
    
    // Create the slug for the album
    const albumSlug = createSlug(title);
    
    // Define directory paths
    const albumsDir = path.join(rootDir, '_albums');
    const photosDir = path.join(rootDir, 'photos', albumSlug);
    
    // Create directories
    createDirectory(albumsDir);
    createDirectory(photosDir);
    
    // Create the metadata file in the photos directory
    const metadata = {
      title: title,
      description: description,
      date: date,
      created: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(photosDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    // Create the Jekyll collection file
    const frontMatter = `---
layout: album
title: ${title}
description: ${description}
date: ${date}
slug: ${albumSlug}
---

${description}
`;
    
    fs.writeFileSync(
      path.join(albumsDir, `${albumSlug}.md`),
      frontMatter
    );
    
    console.log(`\nAlbum '${title}' created successfully!`);
    console.log(`Album directory: ${photosDir}`);
    console.log(`Jekyll collection file: ${path.join(albumsDir, `${albumSlug}.md`)}`);
    console.log(`\nYou can now add photos to the album directory.`);
    
  } catch (error) {
    console.error('Error creating album:', error);
  } finally {
    rl.close();
  }
}

// Run the script
createAlbum();