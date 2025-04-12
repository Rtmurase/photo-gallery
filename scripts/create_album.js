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
    
    // Get date with default to today, but in MM-YY format
    let dateInput = await askQuestion('Album date (MM-YY), leave blank for current month: ');
    
    // Process the date to ensure it's in YYYY-MM-01 format for Jekyll
    let date;
    if (dateInput.trim() === '') {
      // Use current year and month with day set to 1
      const now = new Date();
      date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    } else {
      // Parse the provided month and year from MM-YY format
      const parts = dateInput.trim().split('-');
      if (parts.length === 2) {
        // Get month and add 20 prefix to year
        const month = parts[0].padStart(2, '0');
        
        // If the year is already 4 digits, use it as is, otherwise add "20" prefix
        let year = parts[1];
        if (year.length === 2) {
          year = `20${year}`;
        } else if (year.length !== 4) {
          year = year.padStart(4, '0');
        }
        
        date = `${year}-${month}-01`;
      } else {
        console.log('Invalid date format. Using current date.');
        const now = new Date();
        date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      }
    }
    
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
date: ${date}
slug: ${albumSlug}
---
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