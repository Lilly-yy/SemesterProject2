# Semester Project 2 – The Golden Bid

## Description

**The Golden Bid** is a front-end auction website built as part of Semester Project 2.  
The project lets users register, create auction listings, and place bids using credits, while non-registered users can browse and search active auctions.

## Goal

The goal is to apply the skills learned over the past three semesters to create a fully functional auction website using a modern front-end workflow and best practices.

## Features

- User registration and login (`@stud.noroff.no` email required)
- User profile with avatar and credit balance
- Create auction listings with title, description, media, tags, and end date
- Browse and search auctions (also available to non-registered users)
- Sort listings (active auctions, ending soon, price, newest)
- Place bids on other users’ listings with credit validation
- View bid history on listings
- Responsive design with mobile-friendly navigation

## Built With

- HTML
- Tailwind CSS
- JavaScript
- Noroff Auction API
- Vite 

## Planning & Design

- **Gantt Chart:** REMEMBER – add link
- **Design Prototype (Figma):** REMEMBER – add link
- **Style Guide:** REMEMBER – add link
- **Kanban Board:** REMEMBER – add link

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- A Noroff API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Lilly-yy/SemesterProject2
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Environment Variables

This project uses environment variables to store the API key securely.

Create a .env file in the root of the project and add:

```env
VITE_API_KEY=your_noroff_api_key_here
```

⚠️ The `.env` file should not be committed to GitHub.

## Running the Project Locally

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Testing instructions

- Register a user with a @stud.noroff.no email address (other emails not allowed)
- New users should start with 1000 credits
- Create a listing with one account
- Place bids on the listing from another account
- Log out to verify that non-registered users can browse and search listings but cannot place bids

## Deployment

The project is deployed using Netlify.

Live demo: [The Golden Bid](https://thegoldenbid.netlify.app/)

## Acknowledgements

- Noroff School of Technology and Digital Media
- Noroff Auction API
