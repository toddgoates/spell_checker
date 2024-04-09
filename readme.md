# Spell Checker

This is a simple Node.js program that runs on the command line and checks if a file you supply contains any typos or words not found in a dictionary file.

## Prerequisites

- Node.js and NPM (I am running Node 20 and NPM 10)

## Installation

1. Clone this repo onto your computer
   ```
   git clone https://github.com/toddgoates/spellchecker
   ```
1. Install NPM packages
   ```
   npm install
   ```

## How to run program

You can run the program like this from your terminal:

```shell
node spellchecker --dictionary <dictionary_file> --input <input_file>
```

This repos contains a dictionary file `dictionary.txt` and two sample files to check `sample-file.txt` and `sample-file-typos.txt`.

Here's an example:

```shell
node spellcheck --dictionary dictionary.txt --input sample-file-typos.txt
```

This will output some text in the terminal that looks like this:

```shell
---------------------------------------------------
Misspelled word: "flie" at line 1, column 16
"is a test flie"
Did you mean one of these words?
flied, flier, fliers, flies, fliest
---------------------------------------------------
```

## My Thoughts

Initially I wasn't sure how I was going to complete this challenge, but it didn't seem to bad once I got started.

It's been a while since I had built a terminal application in Node.js, so I had to refresh my memory on how to detect arguments like `--dictionary` or `--input`. Once I had figured that out, I wanted to have a good user experience, so I added a `--help` argument as well as some error handling for invalid options.

Once that was in place, I then had my script read the dictionary file and input file. Initially I was worried that the dictionary file was too large and would take up lots of memory, but that didn't really seem to be an issue once I started testing. If the dictionary file was much larger, I would probably need to address this. One thought would be to read the file in chunks.

I create an object from the dictionary file and analyze the input file line by line, splitting at spaces to get individual words. If the word (converted to lower case) is not found in the dictionary object, then it's considered to be misspelled.

From there, I check to get the line number and column number to output later on. Initially this seemed simple enough, but I later noticed the column number would sometimes be incorrect for short words like "a" or "in". It was because it was getting the column number at the first occurrence of that string. I later had to modify the code to check for word boundaries.

I wrote a function for getting the surrounding text of a misspelled word. It simply checks for 10 characters before and after the word. If the word is at the start or end of the line, this is taken into account.

Finding similar words was a bit of a challenge. There's no way I could write an algorithm for this in a short amount of time, so I opted to bring in an NPM package. One of the more popular packages was [fuse.js](https://www.fusejs.io/). I've never used this package before, but it worked well, though it took a while to fine-tune the results. I probably need to fine-tune them some more. I created a function that checks for similar words and returns the first 5 results, though often there are dozens or hundreds of results.
