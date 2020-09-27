// const viruses = document.querySelectorAll(".virus");
let allCountries = {};

// viruses.forEach((virus, ind) => {
//   virus.style.top = `${Math.random() * 100 - 15}%`;
//   virus.style.left = `${ind * 10 + 5}%`;
// });
getAll();

async function getAll() {
  // All Tasks
  await Promise.all([
    getCountries(),
    displayGlobalData(),
    displayGlobalTimeline(),
    displayNewCases(),
  ]);

  document.querySelector(".spinner-grow").classList.add("d-none");
  document.querySelector(".main-content").classList.remove("d-none");
}

async function getGlobalTimeline() {
  const response = await fetch(`https://covid19-api.org/api/timeline`);
  let json = await response.json();
  json = json.slice(0, 30);

  const confirmed = json
    .map((el) => {
      return {
        x: new Date(el.last_update),
        y: el.total_cases,
      };
    })
    .reverse();

  const deaths = json
    .map((el) => {
      return {
        x: new Date(el.last_update),
        y: el.total_deaths,
      };
    })
    .reverse();

  const recovered = json
    .map((el) => {
      return {
        x: new Date(el.last_update),
        y: el.total_recovered,
      };
    })
    .reverse();

  return { confirmed, deaths, recovered };
}

async function displayGlobalTimeline() {
  let data = await getGlobalTimeline();

  const lineCanvas = document.getElementById("line-graph").getContext("2d");
  const lineGraph = new Chart(lineCanvas, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Confirmed",
          data: data.confirmed,
          fill: false,
          backgroundColor: "#17a2b8",
          borderColor: "#17a2b8",
          // borderWidth: 1,
          // pointRadius: 1,
        },
        {
          label: "Recovered",
          data: data.recovered,
          fill: false,
          backgroundColor: "#28a745",
          borderColor: "#28a745",
          // borderWidth: 1,
          // pointRadius: 1,
        },
        {
          label: "Deaths",
          data: data.deaths,
          fill: false,
          backgroundColor: "#dc3545",
          borderColor: "#dc3545",
          // borderWidth: 1,
          // pointRadius: 1,
        },
      ],
    },
    options: {
      scales: {
        xAxes: [
          {
            type: "time",
          },
        ],
      },
    },
  });
}

async function getGlobalData() {
  const response = await fetch(`https://covid19.mathdro.id/api`);
  const json = await response.json();

  //Extracting the GLOBAL DATA
  const currentConfirmed = json.confirmed.value;
  const currentDeaths = json.deaths.value;
  const currentRecovered = json.recovered.value;
  const lastUpd = json.lastUpdate;

  return [currentConfirmed, currentRecovered, currentDeaths, lastUpd];
}

async function displayGlobalData() {
  const data = await getGlobalData();
  const cardTitles = document.querySelectorAll(".global-card-title");
  cardTitles.forEach((cardTitle, ind) => {
    cardTitle.textContent = data[ind];
  });
  const lastUpd = document.querySelector("#last-update");
  lastUpd.innerHTML = `
  <i class="fas fa-exclamation-circle text-muted"></i> 
  Last Updated: ${new Date(data[3]).toDateString()}`;
}

async function getCountryData(name) {
  const alpha2 = name.split(",")[1].trim();
  const response = await fetch(`https://covid19-api.org/api/status/${alpha2}`);
  const json = await response.json();

  //Extracting the COUNTRY DATA
  const currentConfirmed = json.cases;
  const currentDeaths = json.deaths;
  const currentRecovered = json.recovered;

  return [currentConfirmed, currentDeaths, currentRecovered];
}

async function displayCountryData(name) {
  const data = await getCountryData(name);
  const cardTitles = document.querySelectorAll(".country-card-title");
  cardTitles.forEach((cardTitle, ind) => {
    cardTitle.textContent = data[ind];
  });

  // Change the Heading
  const heading = document.querySelector(".country-heading");
  heading.innerText = name.split(",")[0].trim();
}

async function getCountries() {
  const response = await fetch("https://covid19-api.org/api/countries");
  const json = await response.json();

  // Extracting the name of the Country
  const countries = json.map((el) => [el.name, el.alpha2]);
  countries.forEach((el) => {
    allCountries[el[1]] = el[0];
  });
  displayTopFive();

  // Selecting DOM elements
  /*
  const cardContainer = document.querySelector(".card__container");
  const card = document.querySelector(".card-fixed");
  const input = document.querySelector("#search-bar");

  input.addEventListener("focus", (e) => {
    card.classList.remove("d-none");
    const htmlItems = countries
      .map((el) => {
        return `<li class="list-group-item list-group-item-action">${el[0]}, ${el[1]}</li>`;
      })
      .join("");
    cardContainer.innerHTML = htmlItems;
  });

  input.addEventListener("blur", (e) => {
    card.classList.add("d-none");
    cardContainer.innerHTML = "";
  });

  input.addEventListener("input", (e) => {
    card.classList.remove("d-none");
    const searchTerm = input.value;

    let matches = countries.filter((el) => {
      const regExp = new RegExp(`^${searchTerm}`, "gi");
      return el[0].match(regExp);
    });

    const htmlItems = matches
      .map((el) => {
        return `<a class="list-group-item list-group-item-action">${el[0]}, ${el[1]}</a>`;
      })
      .join("");

    if (htmlItems.length === 0) {
      card.classList.add("d-none");
    }

    cardContainer.innerHTML = htmlItems;
  });

  cardContainer.addEventListener("mousedown", (e) => {
    input.value = e.target.innerText;
    displayCountryData(e.target.innerText);
  });
  */
}

async function getTopFive() {
  const response = await fetch("https://covid19-api.org/api/status");
  let json = await response.json();

  return json;
}

async function displayTopFive() {
  const countryData = await getTopFive();

  // DISPLAY INDIA's DATA
  countryData.forEach((el) => {
    if (el.country === "IN") {
      const canvas = document.getElementById("india-data").getContext("2d");
      const graph = new Chart(canvas, {
        type: "doughnut",
        data: {
          datasets: [
            {
              data: [el.cases, el.recovered, el.deaths],
              backgroundColor: ["#17a2b862", "#28a74562", "#dc354562"],
              borderColor: ["#17a2b8", "#28a745", "#dc3545"],
              hoverBackgroundColor: ["#17a2b8", "#28a745", "#dc3545"],
            },
          ],
          labels: ["Confirmed", "Recovered", "Deaths"],
        },
      });
      return;
    }
  });

  // HIGHEST RECOVERY RATE
  // let bestCountry;
  // let bestRR = 0;
  // for (let i = 0; i < countryData.length; i++) {
  //   const currRR = countryData[i].recovered / countryData[i].cases;

  //   if (currRR > bestRR) {
  //     bestRR = currRR;
  //     bestCountry = countryData[i].country;
  //   }
  // }
  // console.log(bestCountry, bestRR);

  // DISPLAY ALL COUNTRIES
  const tableBody = document.querySelector("#table-body");
  countryData.forEach((el, ind) => {
    if (el.cases < 1) return;

    tableBody.innerHTML += `
    <tr>
      <th scope="row">${ind + 1}</th>
      <td class="row-name"><img id="flag" src="https://www.countryflags.io/${
        el.country
      }/flat/16.png"> ${allCountries[el.country]}</td>
      <td class="table-info">${el.cases}</td>
      <td class="table-success">${el.recovered}</td>
      <td class="table-danger">${el.deaths}</td>
    </tr>
    `;
  });

  // DISPLAY TOP-5 COUNTRIES
  const topFive = countryData.slice(0, 5);

  const names = topFive.map((el) => el.country);
  const confirmed = topFive.map((el) => el.cases);
  const deaths = topFive.map((el) => el.deaths);
  const recovered = topFive.map((el) => el.recovered);

  const canvas = document.getElementById("top-five").getContext("2d");
  const graph = new Chart(canvas, {
    type: "bar",
    data: {
      labels: names,
      datasets: [
        {
          label: "Confirmed",
          data: confirmed,
          backgroundColor: "#17a2b832",
          borderColor: "#17a2b8",
          borderWidth: 2,
        },
        {
          label: "Recovered",
          data: recovered,
          backgroundColor: "#28a74532",
          borderColor: "#28a745",
          borderWidth: 2,
        },
        {
          label: "Deaths",
          data: deaths,
          backgroundColor: "#dc354532",
          borderColor: "#dc3545",
          borderWidth: 2,
        },
      ],
    },
  });
}

async function getNewCases() {
  const response = await fetch("https://covid19-api.org/api/diff");
  let json = await response.json();

  return json;
}

async function displayNewCases() {
  const data = await getNewCases();

  // DISPLAY TOP-5 COUNTRIES
  const topFive = data.slice(0, 5);

  const names = topFive.map((el) => el.country);
  const confirmed = topFive.map((el) => el.new_cases);
  const deaths = topFive.map((el) => el.new_deaths);
  const recovered = topFive.map((el) => el.new_recovered);

  const canvas = document.getElementById("new-cases").getContext("2d");
  const graph = new Chart(canvas, {
    type: "horizontalBar",
    data: {
      labels: names,
      datasets: [
        {
          label: "Confirmed",
          data: confirmed,
          backgroundColor: "#17a2b832",
          borderColor: "#17a2b8",
          borderWidth: 2,
        },
        {
          label: "Recovered",
          data: recovered,
          backgroundColor: "#28a74532",
          borderColor: "#28a745",
          borderWidth: 2,
        },
        {
          label: "Deaths",
          data: deaths,
          backgroundColor: "#dc354532",
          borderColor: "#dc3545",
          borderWidth: 2,
        },
      ],
    },
  });
}

function convertToName(alpha) {
  for (country of allCountries) {
    if (country[1] === alpha) {
      return country[0];
    }
  }
}

const searchCountry = document.querySelector("#country-search");
searchCountry.addEventListener("keyup", (e) => {
  const search = searchCountry.value.toLowerCase();
  const rowNames = document.querySelectorAll(".row-name");

  rowNames.forEach((name) => {
    if (name.innerText.toLowerCase().trim().startsWith(search)) {
      name.parentElement.style.display = "table-row";
    } else {
      name.parentElement.style.display = "none";
    }
  });
});
