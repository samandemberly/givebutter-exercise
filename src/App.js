import { useEffect, useState } from "react";
import {
  fetchAllPokemon,
  fetchPokemonSpeciesByName,
  fetchPokemonDetailsByName,
  fetchEvolutionChainById,
} from "./api";

const getId = (url) => {
  const match = /(?<=evolution-chain\/)\d*/.exec(url);
  return match ? match[0] : null;
};

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
function App() {
  const [pokemonIndex, setPokemonIndex] = useState([]);
  const [pokemon, setPokemon] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [pokemonDetails, setPokemonDetails] = useState();
  const [pokemonDetailMoves, setPokemonDetailMoves] = useState([]);
  const [evolutionChain, setEvolutionChain] = useState();

  useEffect(() => {
    const fetchPokemon = async () => {
      const { results: pokemonList } = await fetchAllPokemon();

      setPokemon(pokemonList);
      setPokemonIndex(pokemonList);
    };

    fetchPokemon().then(() => {
      /** noop **/
    });
  }, []);

  const onSearchValueChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);
    setPokemonDetails(null);

    setPokemon(pokemonIndex.filter((monster) => monster.name.includes(value)));
  };

  const onGetDetails = (name) => async () => {
    const species = await fetchPokemonSpeciesByName(name);

    const details = await fetchPokemonDetailsByName(name);

    const { chain } = await fetchEvolutionChainById(
      getId(species.evolution_chain.url)
    );

    const currentChain = [];

    const fillChainData = (data) => {
      currentChain.push(data.species.name);
      if (data.evolves_to.length > 0) {
        fillChainData(data.evolves_to[0]);
      }
    };

    fillChainData(chain);
    setEvolutionChain(currentChain);
    setPokemonDetails(details);

    let moveArray = [];
    const usedIndexes = [];

    let i = 0;
    const moves = details.moves;
    if (moves.length < 4) {
      moveArray = [...moves];
    } else {
      while (i < 4) {
        const index = randomIntFromInterval(0, moves.length - 1);
        if (!usedIndexes.includes(index)) {
          usedIndexes.push(index);
          moveArray.push(moves[index]);
          i++;
        }
      }
    }

    setPokemonDetailMoves(moveArray);
  };

  return (
    <div className={"pokedex__container"}>
      <div className={"pokedex__search-input"}>
        <input
          value={searchValue}
          onChange={onSearchValueChange}
          placeholder={"Search Pokemon"}
        />
      </div>
      <div className={"pokedex__content"}>
        {pokemon.length > 0 ? (
          <div className={"pokedex__search-results"}>
            <div className={"pokedex__search-results-container"}>
              {pokemon.map((monster) => {
                return (
                  <div className={"pokedex__list-item"} key={monster.name}>
                    <div>{monster.name}</div>
                    <button
                      className={"pokedex__list-item-button"}
                      onClick={onGetDetails(monster.name)}
                    >
                      Get Details
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <span>No Results Found</span>
        )}
        {pokemonDetails && (
          <div className={"pokedex__details"}>
            <h4>{pokemonDetails.name}</h4>
            <div className={"pokedex__details-types-and-moves"}>
              <div className={"pokedex__details-types-and-moves-section"}>
                <h4>Types</h4>
                <ul>
                  {pokemonDetails.types.map(({ type }) => (
                    <li>{type.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Moves</h4>
                <ul>
                  {pokemonDetailMoves.map(({ move }) => (
                    <li>{move.name}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={"pokedex__details-evolutions"}>
              <span className={"pokedex__details-evolution-title"}>
                Evolutions
              </span>
              <div className={"pokedex__details-evolution-item-list"}>
                {evolutionChain.map((item) => (
                  <p className={"pokedex__details-evolution-item"}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
