// ==UserScript==
// @name        Copy pokemon info - serebii.net
// @namespace   Violentmonkey Scripts
// @match       https://www.serebii.net/brilliantdiamondshiningpearl/battletower/*
// @version     1.0
// @author      s0hv
// @description Add button to battle tower pokemon that allows you to copy-paste their information to https://calc.pokemonshowdown.com/index.html
// @updateURL https://raw.githubusercontent.com/s0hv/serebii-copy-pokemon-info/master/copy-pokemon-info.user.js
// @downloadURL https://raw.githubusercontent.com/s0hv/serebii-copy-pokemon-info/master/copy-pokemon-info.user.js
// @home https://github.com/s0hv/serebii-copy-pokemon-info
// @license MIT
// @grant GM_setClipboard
// ==/UserScript==
const evRegex = /^\s*((\w|\.)+): +(\d+)\s*$/i;
const defaultLevel = 50;
const evTranslation = {
  hp: 'HP',
  atk: 'Atk',
  's.atk': 'SpA',
  def: 'Def',
  's.def': 'SpD',
  spd: 'Spe'
}


/**
 * Pokemon object containing information on a pokemon
 * @param {object} pokemon
 * @param {string} pokemon.name
 * @param {string|Number} pokemon.level
 * @param {string} pokemon.ability
 * @param {string[]} pokemon.moves
 * @param {string?} pokemon.heldItem
 * @param {{[string]: (Number|string)}} pokemon.evs
 * @param {string} pokemon.nature
 */
const pokemonToText = (pokemon) => {
  const { name, level, ability, moves, heldItem, nature, evs } = pokemon;

  let s = name + (heldItem ? ` @ ${heldItem}` : '');
  s += `\nLevel: ${level}`;
  s += `\n${nature} Nature`;
  s += `\nAbility: ${ability}`;
  s += '\nEVs: ' + Object.entries(evs).map(([ev, value]) => `${value} ${evTranslation[ev]}`).join(' / ');
  s += '\n' + moves.map(move => `- ${move}`).join('\n');

  return s;
}

const createCopyButton = (pokemon) => {
  const style = 'background: none; border: none; cursor: pointer;';
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  const btn = document.createElement('button');
  btn.innerText = '📋';
  btn.setAttribute('style', style);
  btn.addEventListener('click', () => GM_setClipboard(pokemonToText(pokemon)));

  td.appendChild(btn);
  tr.appendChild(td);

  return tr;
}

const addCopyButtonToPokemon = (table) => {
  const cells = table.getElementsByTagName('td');

  const pokemon = {};

  pokemon.name = cells[1].textContent;
  pokemon.ability = cells[3].querySelector('a').textContent;
  pokemon.moves = Array.from(cells[4].querySelectorAll('a')).map(a => a.textContent);
  pokemon.heldItem = cells[5].querySelector('a').textContent;
  pokemon.nature = cells[6].childNodes[3].textContent;
  pokemon.level = defaultLevel;
  pokemon.evs = Array.from(cells[7].childNodes).reduce((o, val) => {
    const match = val.textContent.match(evRegex);
    if (!match) return o;

    return  {
      ...o,
      [match[1].toLowerCase()]: match[3]
    }
  }, {});

  console.log(pokemon);
  table.appendChild(createCopyButton(pokemon));
};

const addCopyButtonToTeam = (el) => {
  const tables = el.querySelectorAll('table');
  if (tables.length === 0) return;

  tables.forEach(addCopyButtonToPokemon)
};

const teams = document.querySelectorAll('table.trainer');
teams.forEach(addCopyButtonToTeam);
