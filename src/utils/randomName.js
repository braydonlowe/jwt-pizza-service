/* istanbul ignore file */

function randomName() {
    const adjectives = ['Fast', 'Clever', 'Brave', 'Mighty', 'Wise'];
    const nouns = ['Lion', 'Tiger', 'Eagle', 'Shark', 'Panther'];
  
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
    return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 1000)}`;
  }
  
  module.exports = randomName;