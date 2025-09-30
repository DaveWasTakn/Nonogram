# Nonogram
An Angular application that lets you play and solve Nonogram (Picross) puzzles.

Hosted at: https://nonogram.pfliegler.at/

<img src="public/puzzle_empty.png"></img>
<img src="public/puzzle_solved.png"></img>

## TODOs
- [ ] Confirmation dialogue when starting a new game if the current game is edited
- [x] Save state in local storage
  - [x] Resume game from local storage
- [ ] Share button and url-encode state
  - [ ] Resume game from url-encoded parameter
- [ ] Smarter puzzle creation algorithm
  - [ ] Check solvability
  - [ ] Investigate solving-difficulty
- [ ] Congratulations message on puzzle completion
- [ ] Statistics
  - [ ] E.g. Total solved puzzles 
  - [x] daily streak
- [ ] Info screen
  - [ ] Game rules and mouse controls
- [ ] Clean up mouse and touch controls (merge common functionality)
- [x] Mobile version
  - [x] Mobile friendly input and styling
  - [x] Build for mobile devices (with Capacitor? https://capacitorjs.com/)
