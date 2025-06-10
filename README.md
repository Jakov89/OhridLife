# OhridLife - Your Guide to Life in Ohrid

Welcome to OhridLife, a dynamic web application designed to be your ultimate guide to the vibrant life and culture of Ohrid, North Macedonia. Discover upcoming events, explore popular venues, learn about the city's rich history, and plan your perfect day with our integrated Day Planner.

## Table of Contents
* [Features](#features)
* [Technologies Used](#technologies-used)
* [Project Structure](#project-structure)
* [Setup and Installation](#setup-and-installation)
* [Usage](#usage)
* [Data Sources](#data-sources)
* [Future Enhancements](#future-enhancements)
* [Conclusion](#conclusion)

## Features

- **Event Listings:** Browse a filterable list of upcoming events. Users can filter events by a specific date using a Flatpickr date picker.
- **Venue Recommendations:** Explore various venues categorized by type (e.g., 'Food & Drinks', 'Beach Life', 'Adventure/Sport').
- **Popular Venues:** A dedicated section showcasing top-rated venues.
- **Detailed Venue & Event Modals:** Click on a venue or event to see detailed information, including descriptions, images, ratings, working hours, and a location map.
- **Learn About Ohrid:** A dedicated page with rich text and a photo slideshow providing historical and cultural information about Ohrid, with language support for both Macedonian and English.
- **Day Planner:** An interactive tool allowing users to build a personalized daily itinerary. 
  - Add custom activities through a dedicated form.
  - Dynamically search and add any event from the main event list directly to the plan for the selected date.
  - Organize items with drag-and-drop functionality.
  - Plans are saved to the browser's local storage.
- **Social & Contact Links:** Easy access to Instagram and email contact information in the site footer.
- **Multi-language Support:** The "Learn about Ohrid" and "Културолошко лето" sections support both Macedonian and English content.
- **Responsive Design:** A mobile-first design that adapts to various screen sizes, featuring a modern slide-in navigation menu for mobile devices.

## Technologies Used

- **HTML5:** For the basic structure of the web pages.
- **CSS3:** For styling, including the use of modern features like Flexbox, Grid, custom properties (variables), and responsive media queries.
- **JavaScript (ES6+):** For all dynamic functionality, including data fetching, DOM manipulation, event handling, and managing application state.
- **JSON:** As the format for storing all data (venues, events, text content).
- **Flatpickr:** A lightweight and powerful date picker library used for filtering events and planning.

## Project Structure
```
.
├── data/
│   ├── events.json             # Data for individual events, linked to venues
│   ├── learn_ohrid_text.json   # Text content & image paths for the "Learn about Ohrid" page (MK & EN)
│   └── venues.json             # Comprehensive data for all venues
├── images_venue/               # Local images for venue cards (e.g., kadmo_bar_card.jpeg)
├── images_ohrid/               # Local images for the "Learn About Ohrid" page slideshow
├── main_event/                 # Local images for hero section events (e.g., kulturoloska2025_hero.jpg)
├── index.html                  # Main HTML structure of the application
├── script.js                   # Core JavaScript for all dynamic functionality, data fetching, rendering
├── style.css                   # CSS for styling the application
└── README.md                   # This file
```

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd OhridLife
    ```
3.  **Run a local server:**
    Since the application uses `fetch()` to load local JSON files, you need to run it through a local web server to avoid CORS errors. A simple way is to use Python's built-in HTTP server.

    If you have Python 3 installed:
    ```bash
    python -m http.server
    ```
    If you have Python 2 installed:
    ```bash
    python -m SimpleHTTPServer
    ```
    Alternatively, you can use other tools like the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for VS Code.

4.  **Open in your browser:**
    Navigate to `http://localhost:8000` (or the port specified by your server).

## Usage

Navigate through the different sections using the navigation bar. Explore events, venues, and cultural pages. Use the Day Planner to create and manage your personal schedule for your visit to Ohrid.

## Data Sources

All data for the application is stored in JSON files within the `/data` directory. This makes it easy to update content without touching the core HTML, CSS, or JavaScript files.
- `venues.json`: Contains a list of all venues with details like name, type, rating, location, etc.
- `events.json`: Lists all individual events, which can be linked to specific venues.
- `learn_ohrid_text.json`: Contains the language-specific text and image paths for the "Learn about Ohrid" page.

## Future Enhancements

- **More Categories:** Expand venue categories to include hospitality (hotels, apartments), car rentals, and shopping.
- **Advanced Filtering:** Add more complex filtering options for venues, such as by price, rating, or specific amenities.
- **User Accounts:** Allow users to create accounts to save their day plans and favorite venues permanently.
- **Booking Integration:** Integrate with booking platforms to allow direct reservations from the app.
- **CMS Integration:** Connect the application to a headless CMS to allow for easier content management by non-developers.

## Conclusion

This README provides an overview of the OhridLife web application. Explore the code to understand the implementation details further. 