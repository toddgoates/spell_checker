import fs from "fs";
import Fuse from "fuse.js";

function parseArgs(args) {
  const parsedArgs = {
    dictionary: null,
    input: null,
    help: args.includes("--help") || args.includes("-h"),
    add: args.includes("--add") || args.includes("-a"),
  };

  for (let i = 2; i < args.length; i += 2) {
    const arg = args[i];
    const value = args[i + 1];

    switch (arg) {
      case "--dictionary":
      case "-d":
        parsedArgs.dictionary = value;
        break;
      case "--input":
      case "-i":
        parsedArgs.input = value;
        break;
      case "--help":
      case "-h":
        break;
      case "--add":
      case "-a":
        parsedArgs.add = value;
        break;
      default:
        console.log(`Unknown argument: ${arg}`);
    }
  }

  return parsedArgs;
}

function addWordToDictionary(word, dictionary) {
  fs.appendFileSync(dictionary, word.toLowerCase() + "\n");

  console.log(`Added "${word}" to dictionary.`);
}

function getSurroundingText(line, columnNumber) {
  const surroundingText = line.substring(
    Math.max(0, columnNumber - 10),
    Math.min(line.length, columnNumber + 10)
  );

  return surroundingText;
}

function getSimilarWords(word, dictionary) {
  const options = {
    isCaseSensitive: false,
    includeScore: true,
    threshold: 0.001,
    distance: 1000,
  };
  const fuse = new Fuse(dictionary, options);

  const results = fuse.search(word);

  if (results.length === 0) {
    return [];
  }

  const similarWords = results.slice(0, 5).map((result) => result.item);
  return similarWords;
}

function main() {
  // Check arguments
  const args = process.argv;
  const parsedArgs = parseArgs(args);

  let errors = false;

  if (parsedArgs.add) {
    if (!parsedArgs.dictionary) {
      console.log("Missing argument: --dictionary");
      process.exit(1);
    }

    addWordToDictionary(parsedArgs.add, parsedArgs.dictionary);
    process.exit(0);
  }

  if (parsedArgs.help) {
    console.log(
      "-d, --dictionary: the dictionary file your spellchecker will use.\r\n" +
        "-i, --input: the file that the spellcheck will be run on.\r\n" +
        "-a, --add: add a word to the dictionary.\r\n" +
        "Example usage (run spellchecker): node spellchecker --dictionary <dictionary_file> --input <input_file>\r\n" +
        "Example usage (add word to dictionary): node spellchecker --dictionary <dictionary_file> --add <word>"
    );

    process.exit(0);
  }

  if (!parsedArgs.dictionary) {
    console.log("Missing argument: --dictionary");
    errors = true;
  }

  if (!parsedArgs.input) {
    console.log("Missing argument: --input.");
    errors = true;
  }

  if (errors) {
    console.log("For help, use --help or -h.");
    process.exit(1);
  }

  // Read the dictionary file
  const dictionaryFile = fs
    .readFileSync(parsedArgs.dictionary, "utf8")
    .split("\n");

  // Convert the dictionary file to a dictionary object
  const dictionary = {};
  dictionaryFile.forEach((word) => {
    dictionary[word] = true;
  });

  // Read the input file
  const inputFile = fs.readFileSync(parsedArgs.input, "utf8").split("\n");

  // Create an array to store misspelled words
  const misspelledWords = [];

  // Check each line in the input file for misspelled words
  inputFile.forEach((line, lineNumber) => {
    const words = line.split(" ");

    words.forEach((word) => {
      if (!dictionary[word.toLowerCase()]) {
        // Get the column number, need to check word boundaries
        const match = line.match(new RegExp("\\b" + word + "\\b"));
        const columnNumber = match ? match.index : -1;

        // Get surrounding text
        const surroundingText = getSurroundingText(line, columnNumber);

        // Find similar words
        const similarWords = getSimilarWords(word, Object.keys(dictionary));

        misspelledWords.push({
          word,
          lineNumber,
          columnNumber,
          surroundingText,
          similarWords,
        });
      }
    });
  });

  // Output the misspelled words
  if (misspelledWords.length > 0) {
    misspelledWords.forEach((misspelledWord) => {
      console.log("---------------------------------------------------");

      console.log(
        `Misspelled word "${misspelledWord.word}" at line ${
          misspelledWord.lineNumber + 1
        }, column ${misspelledWord.columnNumber + 1}`
      );

      console.log(`"${misspelledWord.surroundingText}"`);

      if (misspelledWord.similarWords.length > 0) {
        console.log("Did you mean one of these words?");
        console.log(misspelledWord.similarWords.join(", "));
      } else {
        console.log("No similar words found.");
      }
    });
  } else {
    console.log("No misspelled words found!");
  }

  process.exit(0);
}

main();
