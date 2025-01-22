import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

// Tarayıcının SpeechRecognition API'sı
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export const UI = ({ hidden }) => {
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const initSpeechRecognition = () => {
    // Zaten oluşturduysak tekrar oluşturma
    if (!recognitionRef.current && SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US"; // veya "tr-TR"
      recognition.interimResults = false; // Parça parça değil, tek seferde final sonuç
      recognition.continuous = false;     // Konuşma bitince otomatik duracak

      // Konuşma başarıyla metne çevrildiğinde
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Konuşma metni:", transcript);

        // Otomatik olarak OpenAI'ye gönder
        if (transcript.trim().length > 0 && !loading && !message) {
          chat(transcript.trim());
        }

        setListening(false);
      };

      // Hata yakalama
      recognition.onerror = (err) => {
        console.error("SpeechRecognition hatası:", err);
        setListening(false);
      };

      // Kullanıcı sustuğunda veya konuşma bittiğinde
      recognition.onend = () => {
        console.log("Dinleme bitti");
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Tarayıcınız SpeechRecognition API'sını desteklemiyor.");
      return;
    }
    initSpeechRecognition();
    recognitionRef.current.start();
    setListening(true);
    console.log("Dinleme başlatıldı...");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    console.log("Dinleme durduruldu...");
  };

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
      {/* Üstteki başlık */}
      <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
        <h1 className="font-black text-xl">Assistflow.AI </h1>
        <p>Holoxone DEMO ❤️</p>
      </div>

      {/* Kamera Zoom ve Green Screen Butonları */}
      <div className="w-full flex flex-col items-end justify-center gap-4">
        <button
          onClick={() => setCameraZoomed(!cameraZoomed)}
          className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
        >
          {cameraZoomed ? "Zoom Out" : "Zoom In"}
        </button>
        <button
          onClick={() => {
            document.body.classList.toggle("greenScreen");
          }}
          className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
        >
          Green
        </button>
      </div>

      {/* Mikrofon Başla / Durdur */}
      <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
        {!listening ? (
          <button
            onClick={startListening}
            disabled={loading || message}
            className={`bg-green-500 hover:bg-green-600 text-white p-4 rounded-md ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-md"
          >
            🔴 Stop
          </button>
        )}
      </div>
    </div>
  );
};
