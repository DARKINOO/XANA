const express = require('express');
const fs = require('fs');
const jsonfile = require('jsonfile');
const natural = require('natural');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('front-end'));

// Load intents
const data = jsonfile.readFileSync('back-end/intents[1].json');

// Initialize variables
let words = [];
let labels = [];
let patterns = [];
let patternTags = [];

// Load or create data
try {
  const data2 = fs.readFileSync('back-end/data.pickle', 'utf8');
  [words, labels, patterns, patternTags] = JSON.parse(data2);
  console.log('Data loaded from pickle file');
} catch (err) {
  console.log('Creating new data...');
  const stemmer = natural.PorterStemmer;
  for (const intent of data.intents) {
    for (const pattern of intent.patterns) {
      const wrds = pattern.toLowerCase().split(' ').map(w => stemmer.stem(w));
      words = words.concat(wrds);
      patterns.push(wrds);
      patternTags.push(intent.tag);
    }
    if (!labels.includes(intent.tag)) {
      labels.push(intent.tag);
    }
  }

  words = [...new Set(words)].sort();
  labels = labels.sort();

  fs.writeFileSync('back-end/data.pickle', JSON.stringify([words, labels, patterns, patternTags]));
  console.log('New data created and saved');
}

console.log(`Loaded ${patterns.length} patterns`);

// Helper function to convert input to stemmed words
function stemAndTokenize(s) {
  return s.toLowerCase().split(' ').map(w => natural.PorterStemmer.stem(w));
}

// k-NN classifier
function kNearestNeighbor(input, k = 3) {
  const distances = patterns.map((pattern, index) => {
    const dist = natural.JaroWinklerDistance(input.join(' '), pattern.join(' '));
    return { distance: dist, tag: patternTags[index] };
  });

  distances.sort((a, b) => b.distance - a.distance);
  const nearestK = distances.slice(0, k);
  console.log('Nearest matches:', nearestK);

  const tagCounts = {};
  nearestK.forEach(item => {
    if (tagCounts[item.tag]) {
      tagCounts[item.tag]++;
    } else {
      tagCounts[item.tag] = 1;
    }
  });

  let maxCount = 0;
  let maxTag = '';
  for (const tag in tagCounts) {
    if (tagCounts[tag] > maxCount) {
      maxCount = tagCounts[tag];
      maxTag = tag;
    }
  }

  return maxTag;
}

// Route for chat responses
app.post('/chat', (req, res) => {
  const message = req.body.message;
  console.log('Received message:', message);

  const stemmedInput = stemAndTokenize(message);
  console.log('Stemmed input:', stemmedInput);

  const tag = kNearestNeighbor(stemmedInput);
  console.log('Predicted tag:', tag);

  const intent = data.intents.find(tg => tg.tag === tag);
  if (intent) {
    const response = intent.responses[Math.floor(Math.random() * intent.responses.length)];
    console.log('Response:', response);
    return res.json({ response });
  }

  console.log('No matching intent found');
  res.json({ response: "I didn't understand that." });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});