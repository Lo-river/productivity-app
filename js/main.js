// För gemensam js-kod

// Funktion för att uppdatera dagens datum
function updateDate() {
    const dateElement = document.querySelector(".date"); // Hitta elementet med klassen "date"

    if (dateElement) { // Kolla att elementet finns på sidan
        const today = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = today.toLocaleDateString("en-GB", options).toUpperCase();

        dateElement.textContent = formattedDate; // Uppdatera texten i HTML
    }
}

// Kör funktionen när sidan laddas
document.addEventListener("DOMContentLoaded", updateDate);
