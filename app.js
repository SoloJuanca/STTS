const startButton = document.getElementById("startButton");
const output = document.getElementById("output");

let voicesPopulated = false;

const profaneWordsMap = new Map([
  ["\\*\\*\\*\\*\\*", "joder"],
  ["J\\*\\*\\*\\*", "joder"],
  ["\\*\\*\\*\\*\\*\\*\\*", "pendejo"],
  ["P\\*\\*\\*\\*\\*\\*", "pendejo"],
  ["\\*\\*\\*\\*", "puta"],
  ["P\\*\\*\\*", "puta"],
  // Agrega más palabras y sus variaciones censuradas con y sin la primera letra según sea necesario
]);

function uncensor(text) {
  let uncensoredText = text;
  profaneWordsMap.forEach((uncensored, censored) => {
    const regex = new RegExp(censored, "gi");
    uncensoredText = uncensoredText.replace(regex, uncensored);
  });
  return uncensoredText;
}

startButton.addEventListener("click", () => {
  startButton.disabled = true;
  initVoiceRecognition();
  console.log("Voice recognition started")
});

async function initVoiceRecognition() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recognition = new webkitSpeechRecognition();
    const synth = window.speechSynthesis;

    recognition.lang = "es-MX";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const text = result[0].transcript;
        const uncensoredText = uncensor(text);
        output.innerText = text;
        speak(uncensoredText, synth);
      }
    };

    recognition.onerror = (event) => {
      console.log("Error:", event.error)
      if (event.error === "no-speech") {
        console.log("No se detectó entrada de voz. Reconexión en curso...");
      } else {
        console.error("Error:", event.error);
        startButton.disabled = false;
      }
    };

    recognition.onend = () => {
      console.log("Reconexión en curso...");
      recognition.start();
    };

    recognition.start();
  } catch (error) {
    console.error("Error:", error);
    startButton.disabled = false;
  }
}

function speak(text, synth) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-MX";
  synth.speak(utterance);
}

// Agrega una función para llenar la lista desplegable con las voces disponibles
function populateVoiceList(synth) {
    if (voicesPopulated) {
      return;
    }

    const voiceSelect = document.getElementById("voiceSelect");
    const voices = synth.getVoices();
  
    voices.forEach((voice, index) => {
      const option = document.createElement("option");
      option.textContent = `${voice.name} (${voice.lang})`;
      option.setAttribute("value", index);
      voiceSelect.appendChild(option);
    });

    voicesPopulated = true;
  }
  
  // Modifica la función speak para utilizar la voz seleccionada en la lista desplegable
  function speak(text, synth) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceSelect = document.getElementById("voiceSelect");
    const voices = synth.getVoices();
    const selectedVoiceIndex = voiceSelect.value;
  
    if (selectedVoiceIndex !== "") {
      utterance.voice = voices[selectedVoiceIndex];
    }
  
    utterance.lang = "es-MX"; // Puedes eliminar esta línea si quieres que la voz se base en la selección del usuario
    synth.speak(utterance);
  }
  
  // Llama a la función populateVoiceList cuando las voces estén cargadas
  if (typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      if (!voicesPopulated) {
        populateVoiceList(window.speechSynthesis);
      }
    };
  }