# MyVIRS Public-Domain Readability Test Passages

This folder contains 10 fixed passages for MyVIRS regression and readability testing.
There are two passages in each test category: Easy, Easy–Medium, Medium, Medium–Hard, and Hard / College.

## Important notes

- Every passage contains at least 100 words. The counts below use a simple word-token count; MyVIRS may count punctuation or hyphenated terms slightly differently.
- Each passage is taken from the underlying text of a Project Gutenberg book that Project Gutenberg identifies as **Public domain in the USA**.
- Gutenberg headers, license text, page-number artifacts, image captions, and formatting markers were excluded so they do not interfere with MyVIRS analysis.

## Passage sources

### Easy

#### `easy_01_geography.txt`
- Word count in this package: **193**
- Title: *Home Geography for Primary Grades*
- Author(s): C. C. Long
- Subject: Geography
- Project Gutenberg eBook: #12228
- Gutenberg reading information: Reading ease 93.8 (5th grade; very easy)
- Copyright status on Project Gutenberg: Public domain in the USA
- Source: https://www.gutenberg.org/ebooks/12228

#### `easy_02_nature.txt`
- Word count in this package: **246**
- Title: *The Child's Book of Nature*
- Author(s): Worthington Hooker
- Subject: Nature / Plants
- Project Gutenberg eBook: #58421
- Gutenberg reading information: Reading ease 89.9 (6th grade; easy)
- Copyright status on Project Gutenberg: Public domain in the USA
- Source: https://www.gutenberg.org/ebooks/58421

### Easy–Medium

#### `easy_medium_01_chemistry.txt`
- Word count in this package: **188**
- Title: *An Introduction to Chemical Science*
- Author(s): Rufus P. Williams
- Subject: Chemistry
- Project Gutenberg eBook: #3708
- Gutenberg reading information: Reading ease 75.5 (7th grade; fairly easy)
- Copyright status on Project Gutenberg: Public domain in the USA
- Source: https://www.gutenberg.org/ebooks/3708

#### `easy_medium_02_history.txt`
- Word count in this package: **235**
- Title: *The Story of American History for Elementary Schools*
- Author(s): Albert F. Blaisdell
- Subject: American History
- Project Gutenberg eBook: #34600
- Gutenberg reading information: Reading ease 71.1 (7th grade; fairly easy)
- Copyright status on Project Gutenberg: Public domain in the USA
- Source: https://www.gutenberg.org/ebooks/34600

### Medium

#### `medium_01_chemistry.txt`
- Word count in this package: **229**
- Title: *An Elementary Study of Chemistry*
- Author(s): William McPherson and William Edwards Henderson
- Subject: Chemistry
- Project Gutenberg eBook: #20848
- Gutenberg reading information: Reading ease 62.3 (8th–9th grade)
- Copyright status on Project Gutenberg: Public domain in the USA
- Source: https://www.gutenberg.org/ebooks/20848

#### `medium_02_biology.txt`
- Word count in this package: **272**
- Title: *First Course in Biology*
- Author(s): L. H. Bailey and Walter Moore Coleman
- Subject: Biology
- Project Gutenberg eBook: #76851
- Gutenberg reading information: Secondary-school biology textbook; Gutenberg currently lists no reading-ease score
- Copyright status on Project Gutenberg: Public domain in the USA
- Source: https://www.gutenberg.org/ebooks/76851

### Medium–Hard

#### `medium_hard_01_history.txt`
- Word count in this package: **110**
- Title: *General History for Colleges and High Schools*
- Author(s): P. V. N. Myers
- Subject: World History
- Project Gutenberg eBook: #6804
- Gutenberg reading information: Reading ease 59.2 (10th–12th grade; somewhat difficult)
- Copyright status on Project Gutenberg: Public domain in the USA
- Source: https://www.gutenberg.org/ebooks/6804

#### `medium_hard_02_psychology.txt`
- Word count in this package: **230**
- Title: *Psychology: An Elementary Text-Book*
- Author(s): Hermann Ebbinghaus
- Subject: Psychology
- Project Gutenberg eBook: #52823
- Gutenberg reading information: Reading ease 51.3 (10th–12th grade; somewhat difficult)
- Copyright status on Project Gutenberg: Public domain in the USA
- Source: https://www.gutenberg.org/ebooks/52823

### Hard / College

#### `hard_01_economics.txt`
- Word count in this package: **270**
- Title: *The Basic Facts of Economics: A Common-Sense Primer for Advanced Students*
- Author(s): Louis F. Post
- Subject: Economics
- Project Gutenberg eBook: #73475
- Gutenberg reading information: Reading ease 47.0 (college-level; difficult)
- Copyright status on Project Gutenberg: Public domain in the USA
- Source: https://www.gutenberg.org/ebooks/73475

#### `hard_02_economics.txt`
- Word count in this package: **248**
- Title: *Principles of Political Economy*
- Author(s): Arthur Latham Perry
- Subject: Economics
- Project Gutenberg eBook: #41936
- Gutenberg reading information: Reading ease 47.6 (college-level; difficult)
- Copyright status on Project Gutenberg: Public domain in the USA
- Source: https://www.gutenberg.org/ebooks/41936

## Suggested MyVIRS workflow

Run the same 10 files through each version of MyVIRS and save the output. Compare results after updates to detect changes in readability, K1/K2/K3 classification, AWL/BAW matching, high/medium/low frequency grouping, stemming, tokenization, and word counts.

Because the passages are intended as baselines, changes in output should come from MyVIRS or its word lists/algorithms rather than from changes to the test text.

## Recorded analyzer outputs

Run all 10 passage regression tests from the repository root:

```sh
pnpm test:analyzer
```

On Windows PowerShell, use `pnpm.cmd test:analyzer` if script execution is disabled.
The suite also runs with the core unit tests via `pnpm --filter @repo/core test`.

Each passage is a separate named test. The suite runs the core analyzer with the
checked-in seed dictionary (no database or environment variables required) and
compares its complete result to the paired expected JSON. Missing files or any
output difference fail the command with a nonzero exit code and a test diff.

When changing the analyzer or dictionary, run the tests and review any differences.
Only edit the expected JSON after confirming that the new behavior is intended;
tests never rewrite baselines automatically. To add a passage, add its `.txt` and
reviewed `.expected.json` files here and its name to `src/analyze.regression.test.ts`
in the core package.
