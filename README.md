# OhridHub - Your Ultimate Guide to Life in Ohrid

Welcome to OhridHub, your all-in-one guide to the vibrant culture, events, and attractions of Ohrid, North Macedonia. Whether you're a local or a visitor, our platform helps you discover upcoming events, explore top-rated venues, learn about the city's rich history, and build your perfect day with our interactive Day Planner.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Key Scripts and Functionality](#key-scripts-and-functionality)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Event Calendar**: A dynamic calendar showcasing daily events.
- **Venue Discovery**: Filterable list of venues (restaurants, cafes, adventure sports, etc.).
- **Interactive Day Planner**: Users can create and save a personalized itinerary.
- **Learn About Ohrid**: A dedicated section with historical and cultural information.
- **Featured Events Slider**: Highlights major upcoming events.
- **Responsive Design**: Fully functional on both desktop and mobile devices.
- **Modular Code**: Uses JavaScript modules for better organization and maintenance.

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Libraries**:
  - `flatpickr.js`: For the interactive calendar.
  - `keen-slider.js`: For touch-friendly sliders.
- **Backend (for potential future expansion)**: Node.js with Express is set up for serving files, but core logic is client-side.
- **Development Tools**: Visual Studio Code, Git & GitHub.

## Project Structure

The project is organized into logical folders and files:

- `index.html`: The main landing page.
- `day-planner.html`: The page for the day planner feature.
- `learn.html`: The page for learning about Ohrid.
- `style.css`: Main stylesheet for the entire application.
- `learn.css`: Additional styles for the "Learn About Ohrid" page.
- `common.js`: Contains shared JavaScript functions, such as rendering the navbar and footer.
- `index.js`, `day-planner.js`, `learn.js`: Page-specific JavaScript modules.
- `data/`: Contains JSON files (`events.json`, `venues.json`, etc.) that act as a database.
- `images_ohrid/`, `images_venue/`, `main_event/`: Contain all image assets.
- `server.js`: A simple Express server for local development.

## Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Jakov89/OhridHub.git
    ```
2.  **Navigate to the project directory**:
    ```bash
    cd OhridHub
    ```
3.  **Install dependencies**:
    If you have Node.js and npm installed, you can install the required packages (like `express` for the server).
    ```bash
    npm install
    ```
4.  **Run the local server**:
    ```bash
    node server.js
    ```
5.  **Open in your browser**:
    Navigate to `http://localhost:3000` to see the application in action.

## Usage

Once the application is running, you can:
- Browse the home page to see featured events and venue recommendations.
- Click on "Events" in the navigation to jump to the calendar section.
- Use the calendar to select a date and see what's happening.
- Filter venues by category and sub-category to find places that interest you.
- Visit the "Day Planner" page to build your own schedule.
- Explore the "Learn About Ohrid" page for cultural insights.

## Key Scripts and Functionality

- `common.js`: Dynamically creates the navbar and footer on every page. This ensures consistency and makes it easy to update navigation links site-wide.
- `index.js`: Manages the home page, including fetching all data, populating sliders, handling event calendar interactions, and managing the venue filtering system.
- `day-planner.js`: Contains all logic for the day planner, including saving plans to `localStorage`, populating form dropdowns, and rendering the user's schedule.

## Contributing

Contributions are welcome! If you have ideas for new features or improvements, feel free to fork the repository and submit a pull request.

## License

This project is open-source and available for anyone to use.

---

This README provides an overview of the OhridHub web application. Explore the code to understand the implementation details further. 