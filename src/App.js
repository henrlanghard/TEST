import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Mic, FileText, Activity, Clipboard, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";

// Global initial state for Verlauf
const initialVerlauf = [];

// --- Hilfsfunktionen zur Generierung von Patientendaten und Laborwerten ---

function generatePatientData(insuranceNumber) {
  const names = [
    "Max Mustermann",
    "Erika Musterfrau",
    "Hans Müller",
    "Petra Schmidt",
    "Sven Becker",
    "Laura Schmitt",
    "Tobias Schneider",
    "Mia Fischer"
  ];
  const addresses = [
    "Musterstraße 123, 12345 Musterstadt",
    "Beispielweg 5, 54321 Beispielstadt",
    "Teststraße 77, 67890 Teststadt",
    "Demoallee 9, 98765 Demostadt",
    "Beispielstraße 12, 10115 Berlin",
    "Hauptstraße 99, 80331 München",
    "Feldweg 7, 20095 Hamburg",
    "Ringstraße 8, 50667 Köln"
  ];
  const birthDates = [
    "15.03.1975",
    "22.07.1980",
    "01.01.1990",
    "10.10.1985",
    "05.05.1978",
    "12.09.1992",
    "28.02.1988",
    "30.11.1983"
  ];
  const phones = [
    "+49 157 80860453",
    "+49 152 12345678",
    "+49 160 98765432",
    "+49 151 11112222",
    "+49 170 33344455",
    "+49 160 55566777",
    "+49 159 88899900",
    "+49 152 77766655"
  ];
  const allergies = [
    "Penicillinallergie",
    "Keine Allergien",
    "Latexallergie",
    "Nahrungsmittelallergie"
  ];
  const preChecks = [
    { test: "Blutbild", date: "20.03.2023" },
    { test: "Lipidprofil", date: "20.03.2023" },
    { test: "EKG", date: "15.03.2023" },
    { test: "Blutdruckmessung", date: "01.02.2023" },
    { test: "Blutbild", date: "15.12.2022" }
  ];
  const conditions = [
    ["Diabetes mellitus (seit 2019)", "Hypertonie (seit 2018)"],
    ["Asthma bronchiale (seit 2015)"],
    ["Keine bekannten Erkrankungen"],
    ["Herzinsuffizienz (seit 2020)", "Hypertonie (seit 2018)"],
    ["KHK (seit 2021)"],
    ["Hypertonie (seit 2018)", "Cholesterinprobleme"]
  ];
  const medications = [
    ["Metformin 500mg, 2x täglich", "Lisinopril 10mg, 1x täglich"],
    ["Salbutamol Inhalator, bei Bedarf"],
    ["Keine Medikation"],
    ["Furosemid 40mg, 1x täglich", "Lisinopril 10mg, 1x täglich"],
    ["Atorvastatin 20mg, 1x täglich"],
    ["Amlodipin 5mg, 1x täglich"]
  ];
  const index = Math.floor(Math.random() * names.length);
  return {
    name: names[index],
    birthDate: birthDates[index],
    address: addresses[index],
    phone: phones[index],
    allergies: allergies[Math.floor(Math.random() * allergies.length)],
    preChecks: preChecks,
    conditions: conditions[Math.floor(Math.random() * conditions.length)],
    medications: medications[Math.floor(Math.random() * medications.length)]
  };
}

function generateLabData() {
  const baseCurrent = [
    { param: "Leukozyten", value: 8, unit: "G/l", ref: "4 - 10" },
    { param: "Thrombozyten", value: 220, unit: "G/l", ref: "150 - 360" },
    { param: "Erythrozyten", value: 5.0, unit: "10^3/µl", ref: "4.2 - 5.4" },
    { param: "Hämoglobin", value: 15.5, unit: "g/dl", ref: "13.4 - 17.6" },
    { param: "Hämatokrit", value: 45, unit: "%", ref: "43 - 49" },
    { param: "MCH", value: 29, unit: "pg", ref: "27 - 33" },
    { param: "MCV", value: 90, unit: "fl", ref: "80 - 96" },
    { param: "MCHC", value: 32, unit: "g/dl", ref: "28 - 36" },
  ];
  const baseOlder = [
    { param: "Leukozyten", value: 7.8, unit: "G/l", ref: "4 - 10" },
    { param: "Thrombozyten", value: 215, unit: "G/l", ref: "150 - 360" },
    { param: "Erythrozyten", value: 4.9, unit: "10^3/µl", ref: "4.2 - 5.4" },
    { param: "Hämoglobin", value: 15.0, unit: "g/dl", ref: "13.4 - 17.6" },
    { param: "Hämatokrit", value: 44, unit: "%", ref: "43 - 49" },
    { param: "MCH", value: 28.5, unit: "pg", ref: "27 - 33" },
    { param: "MCV", value: 89, unit: "fl", ref: "80 - 96" },
    { param: "MCHC", value: 31.5, unit: "g/dl", ref: "28 - 36" },
  ];

  const randomize = (base) =>
    base.map((item) => ({
      ...item,
      value: (item.value + (Math.random() * 2 - 1)).toFixed(1),
      date: item === baseCurrent[0] ? "20.03.2023" : "15.12.2022"
    }));

  return {
    currentLabValues: randomize(baseCurrent),
    olderLabValues: randomize(baseOlder)
  };
}

// ---------------------------
// Toast-Komponente
// ---------------------------
function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-5 right-5 z-50 px-4 py-2 rounded shadow-lg text-white ${
            toast.type === "save"
              ? "bg-green-500"
              : toast.type === "error"
              ? "bg-red-500"
              : toast.type === "send"
              ? "bg-purple-500"
              : toast.type === "export"
              ? "bg-blue-700"
              : "bg-blue-500"
          }`}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------
// BackButton (responsive)
// ---------------------------
function BackButton() {
  return (
    <Link
      to="/"
      className="fixed top-2 left-2 sm:top-4 sm:left-4 bg-gray-200 p-2 sm:p-3 rounded-full shadow-md hover:bg-gray-300 transition"
    >
      <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
    </Link>
  );
}

// ---------------------------
// Home-Komponente (Desktop & Mobile optimiert)
// ---------------------------
function Home({ insuranceNumber, setInsuranceNumber, activeProfile, setActiveProfile, resetVerlauf, updatePatientData, updateLabData }) {
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!/^\d{9}$/.test(insuranceNumber)) {
      setError("Versicherungsnummer muss genau 9 Ziffern enthalten.");
      return;
    }
    setError("");
    const patient = generatePatientData(insuranceNumber);
    setActiveProfile({ insuranceNumber, name: patient.name });
    updatePatientData(patient);
    updateLabData(generateLabData());
    resetVerlauf();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 w-full max-w-2xl mx-auto flex flex-col items-center">
        <label htmlFor="insurance" className="block text-lg font-semibold text-gray-800 mb-2">
          Versicherungsnummer
        </label>
        <div className="flex flex-col sm:flex-row sm:space-x-2 w-full">
          <input
            id="insurance"
            type="text"
            maxLength="9"
            value={insuranceNumber}
            onChange={(e) => setInsuranceNumber(e.target.value)}
            placeholder="z.B. 123456789"
            className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleConfirm}
            className="mt-2 sm:mt-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
          >
            Bestätigen
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {activeProfile.insuranceNumber && (
        <div className="bg-white p-4 rounded border border-gray-300 w-full max-w-2xl mx-auto text-center mb-8">
          <p className="text-lg font-semibold text-gray-800">
            Aktuelles Profil: {activeProfile.name}; Versicherungsnummer: {activeProfile.insuranceNumber}
          </p>
        </div>
      )}

      <motion.h1
        className="text-4xl font-bold mb-8 text-center text-gray-800"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Medizinische Assistenz-App
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
        <Link to="/diktierfunktion">
          <div className="p-6 text-center hover:shadow-xl cursor-pointer bg-white rounded-xl border border-gray-200 transition duration-300">
            <Mic className="w-12 h-12 mx-auto text-blue-500" />
            <h2 className="text-xl font-semibold mt-2">Diktierfunktion</h2>
            <p className="text-gray-600">Arztbriefe per Spracheingabe erstellen</p>
          </div>
        </Link>

        <Link to="/verlauf">
          <div className="p-6 text-center hover:shadow-xl cursor-pointer bg-white rounded-xl border border-gray-200 transition duration-300">
            <Clipboard className="w-12 h-12 mx-auto text-yellow-500" />
            <h2 className="text-xl font-semibold mt-2">Arztbrief-Historie</h2>
            <p className="text-gray-600">Diktate und dazugehörige Arztbriefe inklusive Status</p>
          </div>
        </Link>

        <Link to="/laborwerte">
          <div className="p-6 text-center hover:shadow-xl cursor-pointer bg-white rounded-xl border border-gray-200 transition duration-300">
            <Activity className="w-12 h-12 mx-auto text-red-500" />
            <h2 className="text-xl font-semibold mt-2">Laborwerte</h2>
            <p className="text-gray-600">Schneller Zugriff auf alle Laborberichte</p>
          </div>
        </Link>

        <Link to="/patientenakte">
          <div className="p-6 text-center hover:shadow-xl cursor-pointer bg-white rounded-xl border border-gray-200 transition duration-300">
            <FileText className="w-12 h-12 mx-auto text-green-500" />
            <h2 className="text-xl font-semibold mt-2">Patientenakte</h2>
            <p className="text-gray-600">Voruntersuchungen & Diagnosen abrufen</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ---------------------------
// Diktierfunktion
// ---------------------------
function Diktierfunktion({ addToVerlauf, activeProfile, patientData, showToast, updateEntry }) {
  const [dictation, setDictation] = useState("");
  const [arztbrief, setArztbrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedBrief, setEditedBrief] = useState("");
  const [dictationEntryId, setDictationEntryId] = useState(null);
  const [letterEntryId, setLetterEntryId] = useState(null);

  const insuranceNumber = activeProfile.insuranceNumber;
  const scenarios = [
    {
      complaint: "starke Kopfschmerzen, die sich bei Bewegung verstärken",
      diagnosis: "Spannungskopfschmerz",
      recommendation: "Ibuprofen 400mg fortführen und Zustand beobachten.",
      medication: "Ibuprofen 400mg"
    },
    {
      complaint: "akute Schmerzen im rechten Knie nach einem Sturz mit Schwellung",
      diagnosis: "Verdacht auf Meniskusriss",
      recommendation: "MRT-Diagnostik und konservative Therapie.",
      medication: "Ibuprofen 600mg"
    },
    {
      complaint: "akute Rückenschmerzen ohne neurologische Ausfälle",
      diagnosis: "Lumbale Muskelverspannungen",
      recommendation: "Schonung, Wärmeanwendung und Physiotherapie.",
      medication: "Paracetamol 500mg"
    },
    {
      complaint: "intermittierende Bauchschmerzen und Übelkeit",
      diagnosis: "Gastroenteritis",
      recommendation: "Flüssigkeitszufuhr erhöhen und leichte Kost.",
      medication: "Metoclopramid 10mg"
    },
    {
      complaint: "verschlechternde Sehstörungen und Kopfschmerzen mit Übelkeit",
      diagnosis: "Migräne mit Aura",
      recommendation: "Schonung, Trigger vermeiden, ggf. Triptane verabreichen.",
      medication: "Sumatriptan 50mg"
    }
  ];
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const rawDictationText = `Patient klagt über ${scenario.complaint}. Diagnose: ${scenario.diagnosis}. Versicherungsnummer: ${insuranceNumber}. Medikamenteneinnahme: ${scenario.medication}.`;
  const createFormattedLetter = () => {
    return `Musterklinik Musterstadt
Musterstraße 1
12345 Musterstadt

An:
Dr. med. Mustermann
Allgemeinmedizin

Patient: ${patientData.name}
Geburtsdatum: ${patientData.birthDate}
Versicherungsnummer: ${insuranceNumber}
Allergien: ${patientData.allergies}

Sehr geehrte Damen und Herren,

Anamnese: Der Patient berichtete, dass er unter ${scenario.complaint} leidet.

Diagnose: ${scenario.diagnosis}.

Empfehlung: ${scenario.recommendation}

Medikamenteneinnahme: ${scenario.medication}.

Mit freundlichen Grüßen,
Dr. Mustermann`;
  };

  const startDictation = () => {
    const pairId = Date.now();
    setDictation(rawDictationText);
    const newDictEntry = addToVerlauf("Diktat", rawDictationText, "offen", pairId);
    setDictationEntryId(newDictEntry.id);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const formattedBrief = createFormattedLetter();
      setArztbrief(formattedBrief);
      setEditedBrief(formattedBrief);
      const newLetterEntry = addToVerlauf("Arztbrief", formattedBrief, "offen", pairId);
      setLetterEntryId(newLetterEntry.id);
    }, 3000);
  };

  const handleSave = () => {
    if (dictationEntryId && letterEntryId) {
      updateEntry(dictationEntryId, rawDictationText, "gespeichert");
      updateEntry(letterEntryId, arztbrief, "gespeichert");
      showToast("Arztbrief wurde gespeichert!", "save");
    }
  };

  const handleSend = () => {
    if (dictationEntryId && letterEntryId) {
      updateEntry(dictationEntryId, rawDictationText, "verschickt");
      updateEntry(letterEntryId, arztbrief, "verschickt");
      showToast("Arztbrief wurde verschickt!", "send");
    }
  };

  const handleExport = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(arztbrief, 180);
    doc.text(lines, 10, 10);
    doc.save("Arztbrief.pdf");
    showToast("PDF Export erfolgreich!", "export");
  };

  const toggleEditMode = () => {
    if (editMode) {
      setArztbrief(editedBrief);
      updateEntry(letterEntryId, editedBrief, "offen");
      showToast("Änderungen gespeichert.", "save");
    }
    setEditMode(!editMode);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <BackButton />
      <h1 className="text-2xl font-bold mb-4 text-center">Diktierfunktion</h1>
      <div className="flex justify-center">
        <button
          onClick={startDictation}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Diktat starten
        </button>
      </div>
      {dictation && (
        <div className="mt-4">
          <h3 className="font-semibold">Gesprochenes Diktat:</h3>
          <p className="italic text-gray-700 whitespace-pre-line">{dictation}</p>
        </div>
      )}
      {loading && <Loader2 className="animate-spin text-gray-500 mx-auto mt-4" />}
      {arztbrief && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4"
        >
          <h3 className="font-semibold">Generierter Arztbrief:</h3>
          {editMode ? (
            <textarea
              className="w-full p-4 border border-gray-300 rounded font-mono text-sm"
              value={editedBrief}
              onChange={(e) => setEditedBrief(e.target.value)}
              rows="10"
            />
          ) : (
            <pre className="p-4 bg-gray-100 rounded border border-gray-300 font-mono text-sm whitespace-pre-line">
              {arztbrief}
            </pre>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={toggleEditMode}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              {editMode ? "Fertig" : "Bearbeiten"}
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Speichern
            </button>
            <button
              onClick={handleSend}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
            >
              Verschicken
            </button>
            <button
              onClick={handleExport}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
            >
              PDF Export
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ---------------------------
// Patientenakte (verbessertes Desktop-Layout)
// ---------------------------
function Patientenakte({ activeProfile, patientData }) {
  const sortedPreChecks = [...patientData.preChecks].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="container mx-auto px-4 py-6">
      <BackButton />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 border-b pb-2">Patientenakte</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-lg"><span className="font-semibold">Name:</span> {patientData.name}</p>
            <p className="text-lg"><span className="font-semibold">Geburtsdatum:</span> {patientData.birthDate}</p>
          </div>
          <div>
            <p className="text-lg"><span className="font-semibold">Adresse:</span> {patientData.address}</p>
            <p className="text-lg"><span className="font-semibold">Telefon:</span> {patientData.phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-lg"><span className="font-semibold">Versicherungsnummer:</span> {activeProfile.insuranceNumber}</p>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Allergien</h3>
          <p className="text-lg text-gray-600">{patientData.allergies}</p>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Voruntersuchungen</h3>
          <ul className="list-disc list-inside text-lg text-gray-600">
            {sortedPreChecks.map((check, idx) => (
              <li key={idx}>{check.test} am {check.date}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Erkrankungen</h3>
          <ul className="list-disc list-inside text-lg text-gray-600">
            {patientData.conditions.map((cond, idx) => (
              <li key={idx}>{cond}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Medikationen</h3>
          <ul className="list-disc list-inside text-lg text-gray-600">
            {patientData.medications.map((med, idx) => (
              <li key={idx}>{med}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// Laborwerte (verbesserte Überschriften-Ausrichtung)
// ---------------------------
function Laborwerte({ labData }) {
  const { currentLabValues, olderLabValues } = labData;
  return (
    <div className="container mx-auto px-4 py-6">
      <BackButton />
      <h1 className="text-2xl font-bold mb-4 text-center">Laborwerte</h1>
      <h2 className="text-xl font-semibold mt-4 mb-2">Aktueller Laborbericht (20.03.2023) - Blutbild</h2>
      <table className="min-w-full bg-white border mb-2">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b text-left">Analyse</th>
            <th className="px-6 py-3 border-b text-left">Ergebnis</th>
            <th className="px-6 py-3 border-b text-left">Testdatum</th>
            <th className="px-6 py-3 border-b text-left">Referenzbereiche</th>
            <th className="px-6 py-3 border-b text-left">Interpretation</th>
          </tr>
        </thead>
        <tbody>
          {currentLabValues.map((item, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 border-b">{item.param}</td>
              <td className="px-4 py-2 border-b">{item.value} {item.unit}</td>
              <td className="px-4 py-2 border-b">{item.date}</td>
              <td className="px-4 py-2 border-b">{item.ref}</td>
              <td className="px-4 py-2 border-b">{item.interpretation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-gray-700">
        Hinweis: Geringfügige Leukozytose im aktuellen Bericht. Überwachung der Thrombozytenzahl wird empfohlen.
      </p>
      <h2 className="text-xl font-semibold mt-4 mb-2">Älterer Laborbericht (15.12.2022) - Blutbild</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b text-left">Analyse</th>
            <th className="px-6 py-3 border-b text-left">Ergebnis</th>
            <th className="px-6 py-3 border-b text-left">Testdatum</th>
            <th className="px-6 py-3 border-b text-left">Referenzbereiche</th>
            <th className="px-6 py-3 border-b text-left">Interpretation</th>
          </tr>
        </thead>
        <tbody>
          {olderLabValues.map((item, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 border-b">{item.param}</td>
              <td className="px-4 py-2 border-b">{item.value} {item.unit}</td>
              <td className="px-4 py-2 border-b">{item.date}</td>
              <td className="px-4 py-2 border-b">{item.ref}</td>
              <td className="px-4 py-2 border-b">{item.interpretation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------
// Verlauf (Arztbrief-Historie mit Dashboard)
// ---------------------------
function Verlauf({ verlauf, activeProfile, deleteEntry, updateEntry, deleteAllOpen }) {
  const [filter, setFilter] = useState("alle");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const filteredVerlauf = verlauf.filter((entry) => {
    const matchesProfile =
      activeProfile.insuranceNumber &&
      entry.content.includes(`Versicherungsnummer: ${activeProfile.insuranceNumber}`);
    const matchesFilter = filter === "alle" ? true : entry.status === filter;
    return matchesProfile && matchesFilter;
  });

  const groups = {};
  filteredVerlauf.forEach((entry) => {
    const key = entry.pairId ? entry.pairId : entry.id;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
  });
  const sortedGroups = Object.values(groups).sort((a, b) => b[0].id - a[0].id);

  const groupStatuses = Object.values(groups).map((group) => {
    const statuses = group.map((e) => e.status);
    const unique = [...new Set(statuses)];
    return unique.length === 1 ? unique[0] : "offen";
  });
  const openCount = groupStatuses.filter((s) => s === "offen").length;
  const savedCount = groupStatuses.filter((s) => s === "gespeichert").length;
  const sentCount = groupStatuses.filter((s) => s === "verschickt").length;

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditingText(entry.content);
  };

  const saveEditing = (id) => {
    updateEntry(id, editingText, "gespeichert");
    setEditingId(null);
    setEditingText("");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <BackButton />
      <h1 className="text-2xl font-bold mb-4 text-center">Arztbrief-Historie</h1>
      <div className="mb-4 flex flex-wrap justify-around items-center">
        <div className="text-sm font-semibold text-gray-700">Offen: {openCount}</div>
        <div className="text-sm font-semibold text-gray-700">Gespeichert: {savedCount}</div>
        <div className="text-sm font-semibold text-gray-700">Verschickt: {sentCount}</div>
        <button
          onClick={deleteAllOpen}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded text-sm"
        >
          Alle offenen löschen
        </button>
      </div>
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="alle">Alle</option>
          <option value="offen">Offen</option>
          <option value="gespeichert">Gespeichert</option>
          <option value="verschickt">Verschickt</option>
        </select>
      </div>
      {sortedGroups.length === 0 ? (
        <p className="text-gray-700">Bisher keine Einträge.</p>
      ) : (
        <ul>
          {sortedGroups.map((group) => (
            <li key={group[0].id} className="mb-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-gray-700">
                    Status: {(() => {
                      const statuses = group.map((e) => e.status);
                      const unique = [...new Set(statuses)];
                      return unique.length === 1 ? unique[0] : "offen";
                    })()}
                  </h2>
                </div>
                {group.map((item) => (
                  <div key={item.id} className="mb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.timestamp}</p>
                      </div>
                      <div className="flex space-x-2">
                        {editingId === item.id ? (
                          <button
                            onClick={() => saveEditing(item.id)}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            Speichern
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(item)}
                              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded text-xs"
                            >
                              {item.title === "Diktat" && group[0].status === "offen"
                                ? "Fortsetzen"
                                : "Bearbeiten"}
                            </button>
                            <button
                              onClick={() => deleteEntry(item.id)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs"
                            >
                              Löschen
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {editingId === item.id ? (
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded mt-2 font-mono text-sm"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows="4"
                      />
                    ) : (
                      <pre className="bg-gray-100 p-2 rounded mt-1 whitespace-pre-line font-mono text-sm">
                        {item.content}
                      </pre>
                    )}
                  </div>
                ))}
              </motion.div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------
// App-Komponente
// ---------------------------
export default function App() {
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [activeProfile, setActiveProfile] = useState({ name: "", insuranceNumber: "" });
  const [patientData, setPatientData] = useState(generatePatientData("123456789"));
  const [labData, setLabData] = useState(generateLabData());
  const [verlauf, setVerlauf] = useState(initialVerlauf);
  const [toast, setToast] = useState(null);

  const resetVerlauf = () => setVerlauf([]);
  const updatePatientData = (data) => setPatientData(data);
  const updateLabData = (data) => setLabData(data);

  const addToVerlauf = (title, content, status, pairId = null) => {
    const timestamp = new Date().toLocaleString();
    const newEntry = { id: Date.now() + Math.random(), title, content, timestamp, status, pairId };
    setVerlauf((prev) => [...prev, newEntry]);
    return newEntry;
  };

  const deleteEntry = (id) => setVerlauf((prev) => prev.filter((entry) => entry.id !== id));
  const updateEntry = (id, newContent, newStatus) => {
    setVerlauf((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, content: newContent, status: newStatus, timestamp: new Date().toLocaleString() }
          : entry
      )
    );
  };

  const deleteAllOpen = () => setVerlauf((prev) => prev.filter((entry) => entry.status !== "offen"));
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <Router>
      <Toast toast={toast} />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              insuranceNumber={insuranceNumber}
              setInsuranceNumber={setInsuranceNumber}
              activeProfile={activeProfile}
              setActiveProfile={setActiveProfile}
              resetVerlauf={resetVerlauf}
              updatePatientData={updatePatientData}
              updateLabData={updateLabData}
            />
          }
        />
        <Route
          path="/diktierfunktion"
          element={
            <Diktierfunktion
              addToVerlauf={addToVerlauf}
              activeProfile={activeProfile}
              patientData={patientData}
              showToast={showToast}
              updateEntry={updateEntry}
            />
          }
        />
        <Route path="/patientenakte" element={<Patientenakte activeProfile={activeProfile} patientData={patientData} />} />
        <Route path="/laborwerte" element={<Laborwerte labData={labData} />} />
        <Route
          path="/verlauf"
          element={
            <Verlauf
              verlauf={verlauf}
              activeProfile={activeProfile}
              deleteEntry={deleteEntry}
              updateEntry={updateEntry}
              deleteAllOpen={deleteAllOpen}
            />
          }
        />
      </Routes>
    </Router>
  );
}
