const searchWordForm = document.getElementById("searchWordForm");
const wordInput = document.getElementById("wordInput");
const mainDisplay = document.querySelector(".mainDisplay");
const wordDisplay = document.getElementById("wordDisplay");
const phoneticsContent = document.getElementById("phoneticsContent");
const meaningsAndDefinitionContent = document.getElementById("meaningsAndDefinitionContent");

const toastTrigger = document.getElementById('liveToastBtn');
const toastLiveExample = document.getElementById('liveToast');
const errorMessageDisplay = document.getElementById("errorMessageDisplay");
const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);

if (toastTrigger) {
    // const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastTrigger.addEventListener('click', () => {
        toastBootstrap.show();
    })
}

searchWordForm.addEventListener("submit", async event => {

    //prevent default behavior of form to refresh
    event.preventDefault();

    const word = wordInput.value;

    if (!word) {
        // alert("Please input a valid word.");
        errorMessageDisplay.textContent = "Please input a valid word.";
        toastBootstrap.show();
        return;
    }

    try {
        const dictionary = await getDictionaryData(word);
        displayDictionary(dictionary);
    } catch (error) {
        console.error(error);
        // alert(error);
        errorMessageDisplay.textContent = error;
        toastBootstrap.show();
    }
});

async function getDictionaryData(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURI(word)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Oops! We couldn't find that word. Try checking the spelling or searching a different term.");
    }

    return await response.json();
}

function displayDictionary(dictionaryData) {

    const data = dictionaryData[0];
    // console.log(data);

    const word = data.word;
    const phonetic = data.phonetic;
    const phonetics = data.phonetics;
    const meanings = data.meanings;

    mainDisplay.style.display = "block";

    wordDisplay.textContent = word || "";

    // clear previous data
    phoneticsContent.textContent = "";
    meaningsAndDefinitionContent.textContent = "";

    if (phonetics.length > 0) {
        const phoneticsText = document.createElement("h3");
        const phoneticsList = document.createElement("ul");
        const phoneticsSet = new Set();


        if (phonetic) {
            phoneticsSet.add(phonetic);
        }

        phonetics.forEach(element => {
            const phoneticAudioListItemElement = document.createElement("li");
            const phoneticParagraphElement = document.createElement("p");
            const phoneticAudioElement = document.createElement("audio");

            if (element.audio && element.text) {
                phoneticsSet.add(element.text);
                phoneticAudioElement.controls = true;
                phoneticAudioElement.src = element.audio;

                // get the flag emoji and the phonetic
                phoneticParagraphElement.textContent = `${getFlagFromAudio(element.audio)} ${element.text}`;

                phoneticAudioListItemElement.appendChild(phoneticParagraphElement);
                phoneticAudioListItemElement.appendChild(phoneticAudioElement);
                phoneticsList.appendChild(phoneticAudioListItemElement);
                phoneticsList.classList.add("mx-5");
            }

            if (phoneticsSet.size > 0) {
                phoneticsText.textContent = Array.from(phoneticsSet).join(", ");
                phoneticsText.classList.add("mx-5");
            }
        });

        phoneticsContent.appendChild(phoneticsText);
        phoneticsContent.appendChild(phoneticsList);
    }

    if (meanings.length > 0) {

        meanings.forEach(element => {
            const descriptionList = document.createElement("dl");
            const partOfSpeechDisplay = document.createElement("h3");
            const partOfSpeechSynonyms = document.createElement("p");
            const partOfSpeechAntonyms = document.createElement("p");

            partOfSpeechDisplay.textContent = `🌟${element.partOfSpeech}`;

            element.definitions.forEach((definition, index) => {
                const descriptionTerm = document.createElement("dt");
                descriptionTerm.textContent = `${index + 1}. ${definition.definition}`;
                descriptionList.appendChild(descriptionTerm);

                const descriptionDefinition = document.createElement("dd");
                const descriptionDefinitionParagraphExample = document.createElement("p");
                const descriptionDefinitionParagraphSynonym = document.createElement("p");
                const descriptionDefinitionParagraphAntonym = document.createElement("p");

                descriptionTerm.classList.add("mx-5");
                descriptionDefinition.classList.add("mx-5");

                if (definition.example) {
                    descriptionDefinitionParagraphExample.innerHTML = `<strong>Example:</strong> ${definition.example}`;
                    descriptionDefinition.appendChild(descriptionDefinitionParagraphExample);
                }

                if (definition.synonyms.length > 0) {
                    descriptionDefinitionParagraphSynonym.innerHTML = `<strong>Synoynms:</strong> ${definition.synonyms.join(", ")}`;
                    descriptionDefinition.appendChild(descriptionDefinitionParagraphSynonym);
                }

                if (definition.antonyms.length > 0) {
                    descriptionDefinitionParagraphAntonym.innerHTML = `<strong>Antonyms:</strong> ${definition.antonyms.join(", ")}`;
                    descriptionDefinition.appendChild(descriptionDefinitionParagraphAntonym);
                }

                descriptionList.appendChild(descriptionDefinition);
            });

            meaningsAndDefinitionContent.appendChild(partOfSpeechDisplay);
            meaningsAndDefinitionContent.appendChild(descriptionList);

            if (element.synonyms.length > 0) {
                partOfSpeechSynonyms.innerHTML = `<strong>Synonyms (${element.partOfSpeech}):</strong> ${element.synonyms.join(", ")}`;
                meaningsAndDefinitionContent.appendChild(partOfSpeechSynonyms);
                partOfSpeechSynonyms.classList.add("mx-5");
            }
            if (element.antonyms.length > 0) {
                partOfSpeechAntonyms.innerHTML = `<strong>Antonyms (${element.partOfSpeech}):</strong> ${element.antonyms.join(", ")}`;
                meaningsAndDefinitionContent.appendChild(partOfSpeechAntonyms);
                partOfSpeechAntonyms.classList.add("mx-5");
            }
        });

    }

}

function getFlagFromAudio(audioUrl) {
    const filename = audioUrl.split("/").pop(); // gets the last part like "word-uk.mp3"

    if (filename.includes("-uk.mp3")) return "🇬🇧";
    if (filename.includes("-us.mp3")) return "🇺🇸";

    // optional: handle other future suffixes
    if (filename.includes("-au.mp3")) return "🇦🇺";
    if (filename.includes("-ca.mp3")) return "🇨🇦";
    if (filename.includes("-in.mp3")) return "🇮🇳";

    return "🔊"; // fallback icon
}